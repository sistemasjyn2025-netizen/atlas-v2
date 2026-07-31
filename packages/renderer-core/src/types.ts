export interface RenderGeometry {
  type: 'Extrusion' | 'Box' | 'Mesh' | 'Hardware';
  profile?: string;
  length?: number;
  width?: number;
  height?: number;
  diameter?: number;  // For hardware (bolts)
}


export interface RenderNode {
  renderId: string;
  sourceEntityId: string;
  transform: {
    position: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number, w: number }; // quaternion
  };
  geometry: RenderGeometry;
  metadata: Record<string, any>;
  children: RenderNode[];
}

import { InstanceBatch } from './instancing';

export interface SceneGraph {
  instances: InstanceBatch[];
  root: RenderNode;
}

export interface SelectionMapping {
  renderId: string;
  sourceEntityId: string;
  componentType: string;
  manufacturingData?: any;
  documents?: string[];
}
