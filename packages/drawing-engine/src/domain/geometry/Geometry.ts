export interface Point2D {
  x: number;
  y: number;
}

// Analytical Geometry (Pure mathematics, thousands of points)
export interface AnalyticalGeometry {
  type: string;
  points: Point2D[];
}

// Drawable Geometry (Simplified for rendering/printing)
export interface DrawableGeometry {
  type: string;
}

export interface LineGeometry extends DrawableGeometry {
  type: 'Line';
  start: Point2D;
  end: Point2D;
}

export interface CircleGeometry extends DrawableGeometry {
  type: 'Circle';
  center: Point2D;
  radius: number;
}

export interface ArcGeometry extends DrawableGeometry {
  type: 'Arc';
  center: Point2D;
  radius: number;
  startAngle: number;
  endAngle: number;
}

export interface TextGeometry extends DrawableGeometry {
  type: 'Text';
  position: Point2D;
  content: string;
  rotation?: number;
}

export interface PolylineGeometry extends DrawableGeometry {
  type: 'Polyline';
  points: Point2D[];
  closed: boolean;
}
