import { ThreeAdapter } from '../src/ThreeAdapter';
import { SceneGraph } from '@atlas/renderer-core';
import * as THREE from 'three';

describe('ThreeAdapter', () => {
  it('should convert SceneGraph to THREE.Group', () => {
    const adapter = new ThreeAdapter();
    const mockScene: SceneGraph = {
      root: {
        renderId: 'r-1',
        sourceEntityId: 'root',
        transform: { position: {x:0, y:0, z:0}, rotation: {x:0, y:0, z:0, w:1} },
        geometry: { type: 'Box' },
        metadata: {},
        children: [
          {
            renderId: 'r-2',
            sourceEntityId: 'elem1',
            transform: { position: {x:100, y:0, z:0}, rotation: {x:0, y:0, z:0, w:1} },
            geometry: { type: 'Extrusion', length: 5000 },
            metadata: {},
            children: []
          }
        ]
      }
    };

    const group = adapter.convertToScene(mockScene);
    expect(group).toBeInstanceOf(THREE.Group);
    // Root group + root mesh + child mesh
    expect(group.children.length).toBeGreaterThan(0);
  });
});
