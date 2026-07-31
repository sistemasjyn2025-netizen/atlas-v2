export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export enum ProjectionType {
  Top = 'Top',
  Front = 'Front',
  Right = 'Right',
  Left = 'Left',
  Rear = 'Rear',
  Bottom = 'Bottom',
  Isometric = 'Isometric'
}

export interface ClippingRegion {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  minZ?: number;
  maxZ?: number;
}

export interface ProjectionDefinition {
  type: ProjectionType;
  cameraDirection: Point3D;
  upVector: Point3D;
  clippingRegion?: ClippingRegion;
  scale: number;
  tolerance: number;
}
