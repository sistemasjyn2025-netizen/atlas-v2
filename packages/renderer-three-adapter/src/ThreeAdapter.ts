import * as THREE from 'three';
import { RenderNode, SceneGraph } from '@atlas/renderer-core';
import { ProfileGenerator } from './ProfileGenerator';

export class ThreeAdapter {
  private materialElement = new THREE.MeshStandardMaterial({ color: 0x4a5a6a, roughness: 0.35, metalness: 0.85 });
  private materialHardware = new THREE.MeshStandardMaterial({ color: 0x99aab5, roughness: 0.2, metalness: 0.95 });

  public convertToScene(sceneGraph: SceneGraph): THREE.Group {
    const rootGroup = new THREE.Group();
    
    // 1. Build logical hierarchy (empty groups) for raycasting and structure
    const hierarchyRoot = this.convertNode(sceneGraph.root);
    if (hierarchyRoot) {
      rootGroup.add(hierarchyRoot);
    }

    // 2. Build Instanced Meshes from batches
    for (const batch of sceneGraph.instances) {
      const geometry = this.createGeometryFromKey(batch.geometryKey);
      const material = batch.geometryKey.includes('Hardware') ? this.materialHardware : this.materialElement;
      
      const instancedMesh = new THREE.InstancedMesh(geometry, material, batch.instances.length);
      instancedMesh.userData = { isInstancedBatch: true, batchId: batch.batchId };
      
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < batch.instances.length; i++) {
        const instance = batch.instances[i];
        dummy.position.set(instance.position.x, instance.position.y, instance.position.z);
        dummy.quaternion.set(instance.rotation.x, instance.rotation.y, instance.rotation.z, instance.rotation.w);
        // Default Extrusions are aligned along Z in our system usually, we handle it if needed
        if (batch.geometryKey.includes('Extrusion')) {
          const parsed = JSON.parse(batch.geometryKey);
          dummy.position.z += parsed.length / 2; // match legacy logic
        }
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Store mapping from instanceId to renderId for selection
        if (!instancedMesh.userData.instanceMap) {
          instancedMesh.userData.instanceMap = [];
        }
        instancedMesh.userData.instanceMap[i] = instance.renderId;
      }
      
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.computeBoundingSphere();
      rootGroup.add(instancedMesh);
    }

    return rootGroup;
  }

  public convertNode(node: RenderNode): THREE.Object3D {
    const group = new THREE.Group();
    
    // Apply transform
    group.position.set(node.transform.position.x, node.transform.position.y, node.transform.position.z);
    group.quaternion.set(
      node.transform.rotation.x,
      node.transform.rotation.y,
      node.transform.rotation.z,
      node.transform.rotation.w
    );

    // Assign userData for selection mapping
    group.userData = { renderId: node.renderId, isLogicalGroup: true };

    // Note: We no longer create individual THREE.Mesh objects here.
    // They are handled exclusively by the InstancedMesh system in convertToScene.
    // This Group acts purely as a structural container in the SceneGraph.

    // Process children
    for (const child of node.children) {
      const childObj = this.convertNode(child);
      group.add(childObj);
    }

    return group;
  }

  private createGeometryFromKey(geometryKey: string): THREE.BufferGeometry {
    try {
      const geoDef = JSON.parse(geometryKey);
      if (geoDef.type === 'Hardware') {
        const diam = geoDef.diameter || 20;
        const len = geoDef.length || 100;
        const geo = new THREE.CylinderGeometry(diam/2, diam/2, len, 12);
        geo.rotateX(Math.PI/2);
        return geo;
      } else if (geoDef.type === 'Extrusion' && geoDef.profile) {
        const length = geoDef.length || 1000;
        return ProfileGenerator.parseAndCreateProfile(geoDef.profile, length);
      } else {
        const length = geoDef.length || 1000;
        const width = geoDef.width || 200;
        const height = geoDef.height || 200;
        return new THREE.BoxGeometry(width, height, length);
      }
    } catch {
      return new THREE.BoxGeometry(200, 200, 200);
    }
  }
}
