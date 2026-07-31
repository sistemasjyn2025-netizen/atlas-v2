/**
 * Geometric properties of a section.
 * Values are in double precision.
 * Units: Area (mm²), Perimeter (mm), Centroids (mm).
 */
export interface GeometryProperties {
  area: number;
  areaSI?: number; // (m²) - Optional for future expansion
  perimeter: number;
  boundingBox: { width: number, height: number };
  centroid: { cx: number, cy: number };
}

/**
 * Inertia properties of a section.
 * Units: mm⁴
 */
export interface InertiaProperties {
  ix: number;
  iy: number;
  ixy: number;
  j: number; // Torsional constant
}

/**
 * Resistance (modulus) properties of a section.
 * Units: mm³
 */
export interface ResistanceProperties {
  wx: number; // Elastic section modulus (x-axis)
  wy: number; // Elastic section modulus (y-axis)
  zx: number; // Plastic section modulus (x-axis)
  zy: number; // Plastic section modulus (y-axis)
}

/**
 * Stability properties of a section.
 * Units: mm
 */
export interface StabilityProperties {
  rx: number; // Radius of gyration (x-axis)
  ry: number; // Radius of gyration (y-axis)
}

/**
 * Master interface containing all parametric properties of a structural section.
 */
export interface SectionProperties {
  geometry: GeometryProperties;
  inertia: InertiaProperties;
  resistance: ResistanceProperties;
  stability: StabilityProperties;
}
