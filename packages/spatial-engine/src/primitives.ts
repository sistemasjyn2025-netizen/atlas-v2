export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CoordinateSystem {
  origin: Point3D;
  xAxis: Vector3D;
  yAxis: Vector3D;
  zAxis: Vector3D;
}

export interface Transform {
  position: Point3D;
  rotation?: { x: number, y: number, z: number, w?: number }; // Euler or Quaternion
}
