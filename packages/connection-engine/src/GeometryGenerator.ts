import { ConnectionTopology } from './TopologyDetector';
import { EntityManager } from '@atlas/kernel';
import { ConnectionSpecification, Assembly, Component, Element, HardwareSpecification, SheetSpecification } from '@atlas/types';
import { v4 as uuidv4 } from 'uuid';

export class GeometryGenerator {
  public generate(entityManager: EntityManager, topology: ConnectionTopology, spec: ConnectionSpecification): void {
    const graph = entityManager.getGraph();

    // 1. Create a Standalone Assembly for the Connection
    const connectionAssembly: Assembly = {
      id: uuidv4(),
      type: 'Assembly',
      componentIds: [],
      subAssemblyIds: [],
      connectionIds: [],
      transform: { position: { x: 0, y: 0, z: 0 } }
    };

    // 2. Generate Physical Plates
    for (let i = 0; i < spec.plateDimensions.length; i++) {
      const p = spec.plateDimensions[i];
      const sheetSpec: SheetSpecification = {
        id: uuidv4(),
        type: 'Specification',
        specType: 'Sheet',
        thickness: p.thickness,
        material: spec.steelGrade
      };
      graph.specifications[sheetSpec.id] = sheetSpec;

      const plateElement: Element = {
        id: uuidv4(),
        type: 'Element',
        specificationId: sheetSpec.id,
        geometryId: this.generatePlateGeometry(p.width, p.length, p.thickness, entityManager),
        transform: { position: { x: 0, y: 0, z: p.thickness / 2 } }
      };
      
      graph.elements[plateElement.id] = plateElement;
      
      // In this system, Assemblies contain components. We can create a logical Component holding the plates and bolts.
      // Or we can add a sub-component. For simplicity, let's create a Component for the Connection plates.
      const connComp: Component = {
        id: uuidv4(),
        type: 'Component',
        specificationId: sheetSpec.id,
        elementIds: [plateElement.id],
        transform: { position: { x: 0, y: 0, z: 0 } }
      };
      graph.components[connComp.id] = connComp;
      connectionAssembly.componentIds.push(connComp.id);
    }

    // 3. Generate Hardware (Bolts)
    const hardwareSpec: HardwareSpecification = {
      id: uuidv4(),
      type: 'Specification',
      specType: 'Hardware',
      hardwareType: spec.boltLayout.type,
      grade: spec.boltGrade,
      diameter: spec.holeDiameter - 2, // Bolt is slightly smaller than hole
      length: 100 // default length
    };
    graph.specifications[hardwareSpec.id] = hardwareSpec;

    // We'll generate the bolts according to count
    const hardwareComponent: Component = {
      id: uuidv4(),
      type: 'Component',
      specificationId: hardwareSpec.id,
      elementIds: [],
      transform: { position: { x: 0, y: 0, z: 0 } }
    };

    for (let i = 0; i < spec.boltLayout.count; i++) {
      const boltElement: Element = {
        id: uuidv4(),
        type: 'Element',
        specificationId: hardwareSpec.id,
        geometryId: this.generateBoltGeometry(hardwareSpec.diameter, hardwareSpec.length, entityManager),
        // Simple offset for demonstration
        transform: { position: { x: (i * spec.pitch) - (spec.pitch * spec.boltLayout.count/2), y: spec.gauge / 2, z: 0 } }
      };
      graph.elements[boltElement.id] = boltElement;
      hardwareComponent.elementIds.push(boltElement.id);
    }
    
    graph.components[hardwareComponent.id] = hardwareComponent;
    connectionAssembly.componentIds.push(hardwareComponent.id);

    // Save the connection assembly to graph and map it as a connection
    graph.assemblies[connectionAssembly.id] = connectionAssembly;
    graph.specifications[spec.id] = spec;
    
    graph.connections[spec.connectionId] = {
      id: spec.connectionId,
      type: 'Connection',
      connectedEntityIds: [topology.primaryEntityId, ...topology.secondaryEntityIds]
    };
    
    // We add the standalone connection assembly to the project's structural system so it's picked up by rendering
    const sysId = Object.keys(graph.structuralSystems)[0];
    if (sysId) {
      graph.structuralSystems[sysId].assemblyIds.push(connectionAssembly.id);
    }
  }

  private generatePlateGeometry(width: number, length: number, thickness: number, entityManager: EntityManager): string {
    const geoId = uuidv4();
    entityManager.getGraph().geometries[geoId] = {
      id: geoId,
      type: 'Geometry',
      format: 'Extrusion',
      data: {
        profile: { type: 'Rectangle', width, height: length },
        depth: thickness
      }
    };
    return geoId;
  }

  private generateBoltGeometry(diameter: number, length: number, entityManager: EntityManager): string {
    const geoId = uuidv4();
    // Hardware geometry will be processed specially by the renderer LOD
    entityManager.getGraph().geometries[geoId] = {
      id: geoId,
      type: 'Geometry',
      format: 'Hardware',
      data: {
        diameter,
        length
      }
    };
    return geoId;
  }
}
