import { EntityGraph, Element, Component, Assembly, Specification, Geometry } from '@atlas/types';
import { RenderNode, SceneGraph, SelectionMapping } from './types';
import { InstanceManager } from './instancing';
import { v4 as uuidv4 } from 'uuid';

export class AtlasToRenderAdapter {
  private selectionMap: Map<string, SelectionMapping> = new Map();
  private instanceManager: InstanceManager = new InstanceManager();

  public convert(graph: EntityGraph): { scene: SceneGraph, selectionMap: Map<string, SelectionMapping> } {
    this.selectionMap.clear();
    this.instanceManager = new InstanceManager();

    const rootNode: RenderNode = {
      renderId: uuidv4(),
      sourceEntityId: 'root',
      transform: { position: {x:0, y:0, z:0}, rotation: {x:0, y:0, z:0, w:1} },
      geometry: { type: 'Box', width: 0, height: 0, length: 0 },
      metadata: { name: 'Root' },
      children: []
    };

    const rootTransform = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };

    // Iterate structural systems -> assemblies -> components -> elements
    for (const sysId in graph.structuralSystems) {
      const sys = graph.structuralSystems[sysId];
      for (const asmId of sys.assemblyIds) {
        const asmNode = this.convertAssembly(graph, asmId, rootTransform);
        if (asmNode) {
          rootNode.children.push(asmNode);
        }
      }
    }

    return {
      scene: { 
        root: rootNode,
        instances: this.instanceManager.getBatches()
      },
      selectionMap: this.selectionMap
    };
  }

  private compositeTransform(parent: any, local: any) {
    const pw = parent.rotation.w, px = parent.rotation.x, py = parent.rotation.y, pz = parent.rotation.z;
    const lw = local.rotation.w, lx = local.rotation.x, ly = local.rotation.y, lz = local.rotation.z;
    
    // Rotate local.position by parent.rotation
    const vx = local.position.x, vy = local.position.y, vz = local.position.z;
    const ix =  pw * vx + py * vz - pz * vy;
    const iy =  pw * vy + pz * vx - px * vz;
    const iz =  pw * vz + px * vy - py * vx;
    const iw = -px * vx - py * vy - pz * vz;
    
    const rx = ix * pw + iw * -px + iy * -pz - iz * -py;
    const ry = iy * pw + iw * -py + iz * -px - ix * -pz;
    const rz = iz * pw + iw * -pz + ix * -py - iy * -px;

    return {
      position: {
        x: parent.position.x + rx,
        y: parent.position.y + ry,
        z: parent.position.z + rz,
      },
      rotation: {
        x: pw * lx + px * lw + py * lz - pz * ly,
        y: pw * ly - px * lz + py * lw + pz * lx,
        z: pw * lz + px * ly - py * lx + pz * lw,
        w: pw * lw - px * lx - py * ly - pz * lz
      }
    };
  }

  private convertAssembly(graph: EntityGraph, asmId: string, parentTransform: any): RenderNode | null {
    const asm = graph.assemblies[asmId];
    if (!asm) return null;

    const localTransform = this.getTransform(asm);
    const worldTransform = this.compositeTransform(parentTransform, localTransform);

    const renderId = uuidv4();
    const node: RenderNode = {
      renderId,
      sourceEntityId: asmId,
      transform: localTransform, // Keep local for hierarchy
      geometry: { type: 'Box', width: 0, height: 0, length: 0 },
      metadata: { type: 'Assembly', name: `Assembly ${asmId}` },
      children: []
    };

    this.registerSelection(renderId, asmId, 'Assembly');

    for (const compId of asm.componentIds) {
      const compNode = this.convertComponent(graph, compId, worldTransform);
      if (compNode) {
        node.children.push(compNode);
      }
    }

    return node;
  }

  private convertComponent(graph: EntityGraph, compId: string, parentTransform: any): RenderNode | null {
    const comp = graph.components[compId];
    if (!comp) return null;

    const localTransform = this.getTransform(comp);
    const worldTransform = this.compositeTransform(parentTransform, localTransform);

    const renderId = uuidv4();
    const node: RenderNode = {
      renderId,
      sourceEntityId: compId,
      transform: localTransform,
      geometry: { type: 'Box', width: 0, height: 0, length: 0 },
      metadata: { type: 'Component', name: `Component ${compId}` },
      children: []
    };
    
    let mfgData: any = null;
    if (comp.specificationId) {
      const spec = graph.specifications[comp.specificationId] as any;
      if (spec) {
        mfgData = { profile: spec.profile, length: spec.length, material: spec.materialRef };
      }
    }

    this.registerSelection(renderId, compId, 'Component', mfgData);

    for (const elemId of comp.elementIds) {
      const elemNode = this.convertElement(graph, elemId, worldTransform);
      if (elemNode) {
        node.children.push(elemNode);
      }
    }

    return node;
  }

  private convertElement(graph: EntityGraph, elemId: string, parentTransform: any): RenderNode | null {
    const elem = graph.elements[elemId];
    if (!elem) return null;

    let renderGeometry: import('./types').RenderGeometry = { type: 'Extrusion', profile: 'Default', length: 1000 };

    if (elem.geometryId) {
      const geo = graph.geometries[elem.geometryId];
      if (geo) {
        if (geo.format === 'Hardware') {
          renderGeometry = { type: 'Hardware', diameter: geo.data?.diameter ?? 20, length: geo.data?.length ?? 100 };
        } else if (geo.format === 'Extrusion' || geo.format === 'Box') {
          renderGeometry = {
            type: geo.format,
            profile: geo.data?.profile?.type ?? 'Default',
            length: geo.data?.depth ?? 1000,
            width: geo.data?.profile?.width,
            height: geo.data?.profile?.height,
          };
        }
      }
    } else if (elem.specificationId) {
      const spec = graph.specifications[elem.specificationId] as any;
      if (spec) {
        renderGeometry = { type: 'Extrusion', profile: spec.profile ?? 'Default', length: spec.length ?? 1000 };
      }
    }

    const localTransform = this.getTransform(elem);
    const worldTransform = this.compositeTransform(parentTransform, localTransform);

    const renderId = uuidv4();
    const node: RenderNode = {
      renderId,
      sourceEntityId: elemId,
      transform: localTransform,
      geometry: renderGeometry,
      metadata: { type: 'Element', name: `Element ${elemId}` },
      children: []
    };

    this.registerSelection(renderId, elemId, 'Element');

    const geometryKey = JSON.stringify(renderGeometry);
    const materialKey = 'default_material';
    
    this.instanceManager.addInstance(geometryKey, materialKey, {
      renderId,
      sourceEntityId: elemId,
      position: worldTransform.position,
      rotation: worldTransform.rotation,
    });

    return node;
  }

  private getTransform(entity: any) {
    if (entity.transform) {
      return {
        position: { 
          x: entity.transform.position?.x ?? entity.transform.origin?.x ?? 0,
          y: entity.transform.position?.y ?? entity.transform.origin?.y ?? 0,
          z: entity.transform.position?.z ?? entity.transform.origin?.z ?? 0
        },
        rotation: { 
          x: entity.transform.rotation?.x ?? 0,
          y: entity.transform.rotation?.y ?? 0,
          z: entity.transform.rotation?.z ?? 0,
          w: entity.transform.rotation?.w ?? 1
        }
      };
    }
    return { position: {x:0, y:0, z:0}, rotation: {x:0, y:0, z:0, w:1} };
  }

  private registerSelection(renderId: string, sourceEntityId: string, componentType: string, manufacturingData?: any) {
    this.selectionMap.set(renderId, {
      renderId,
      sourceEntityId,
      componentType,
      manufacturingData,
      documents: [] // could be filled by iterating over documents
    });
  }
}
