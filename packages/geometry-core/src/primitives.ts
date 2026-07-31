import { Point3D, Vector3D } from '@atlas/spatial-engine';

export interface Line {
  start: Point3D;
  end: Point3D;
}

export interface Plane {
  origin: Point3D;
  normal: Vector3D;
}

export interface Curve {
  points: Point3D[];
  isClosed: boolean;
}

// Structural Geometry Concepts

export interface Section {
  outerCurve: Curve;
  innerCurves?: Curve[];
}

export interface Profile {
  name: string;
  section: Section;
}

export interface Extrusion {
  profile: Profile;
  path: Line | Curve;
}

export interface BoundingBox {
  min: Point3D;
  max: Point3D;
}

export interface Solid {
  extrusion?: Extrusion;
  volume: number;
  boundingBox: BoundingBox;
}
