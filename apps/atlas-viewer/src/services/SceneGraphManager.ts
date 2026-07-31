import type { PipelineResult } from '@atlas/runtime';
import { DataLoader } from '../utils/DataLoader';
import { ThreeAdapter } from '@atlas/renderer-three-adapter';
import * as THREE from 'three';
import type { SelectionMapping } from '@atlas/renderer-core';

export class SceneGraphManager {
  private _group: THREE.Group = new THREE.Group();
  private _selectionMap: Map<string, SelectionMapping> = new Map();

  constructor() {
    this._group.rotation.x = -Math.PI / 2;
  }

  public get group(): THREE.Group {
    return this._group;
  }

  public get selectionMap(): Map<string, SelectionMapping> {
    return this._selectionMap;
  }

  private disposeGroup(group: THREE.Group | THREE.Object3D) {
    // We traverse children in reverse to safely remove them if needed, though traversing normally to just dispose is fine
    group.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              // Note: If using textures, we would dispose them here: if(mat.map) mat.map.dispose(), etc.
              mat.dispose();
            });
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }

  public applyPipelineResult(result: PipelineResult) {
    // 1. Convert PipelineResult to agnostic RenderScene
    const { renderResult } = DataLoader.convertToRenderable(result);
    this._selectionMap = renderResult.selectionMap;

    // 2. Convert to THREE objects
    const adapter = new ThreeAdapter();
    const newGroup = adapter.convertToScene(renderResult.scene);

    // 3. For the demo, we do a full swap. Future optimizations will diff the nodes here.
    // Memory Leak Fix: Dispose old geometries and materials explicitly!
    this.disposeGroup(this._group);
    
    this._group.clear();
    this._group.add(...(newGroup.children as any));
  }
}
