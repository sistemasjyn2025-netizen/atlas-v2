/**
 * Value object alias for dimensions.
 * Prepared for future unit system integration.
 */
export type Millimeters = number;

export enum SectionShape {
  I = 'I',
  C = 'C',
  L = 'L',
  Box = 'Box',
  Pipe = 'Pipe',
  T = 'T',
  Z = 'Z',
  FlatBar = 'FlatBar',
  RoundBar = 'RoundBar',
  Channel = 'Channel',
  Custom = 'Custom'
}

export enum SectionFamily {
  European = 'European',
  American = 'American',
  Argentine = 'Argentine',
  Custom = 'Custom',
  Parametric = 'Parametric'
}

export enum ManufacturingMethod {
  HotRolled = 'HotRolled',
  ColdFormed = 'ColdFormed',
  Welded = 'Welded',
  Extruded = 'Extruded',
  Cast = 'Cast',
  Custom = 'Custom'
}

// ---------------------------------------------------------------------------
// Geometry Adapter Interfaces
// These represent the canonical topological output for the Geometry Engine.
// (Not implemented in this version, just defining the contract).
// ---------------------------------------------------------------------------

export interface Point2D {
  x: Millimeters;
  y: Millimeters;
}

export interface Segment {
  start: Point2D;
  end: Point2D;
  isCurve: boolean;
  radius?: Millimeters;
}

export interface Loop {
  segments: Segment[];
  isClosed: boolean;
}

export interface Contours {
  outer: Loop;
  inner: Loop[];
}

export interface SectionGeometry {
  contours: Contours;
}
