/**
 * Core types for the ATLAS Material Engine.
 * Internal calculations and outputs are strictly in SI units:
 * Length (m), Area (m²), Volume (m³), Mass (kg), Force/Weight (N), Density (kg/m³).
 */

export enum MaterialCategory {
  Isotropic = 'Isotropic',
  Orthotropic = 'Orthotropic',
  Anisotropic = 'Anisotropic',
  Composite = 'Composite'
}

export enum MaterialFamily {
  Steel = 'Steel',
  Concrete = 'Concrete',
  Aluminum = 'Aluminum',
  Timber = 'Timber',
  Custom = 'Custom'
}

export interface PhysicalProperties {
  density: number;          // kg/m³
  specificWeight: number;   // N/m³ (density * g)
  thermalExpansion: number; // 1/K or 1/°C
}

export interface MechanicalProperties {
  youngModulus: number;     // N/m² (Pa)
  shearModulus: number;     // N/m² (Pa)
  poisson: number;          // unitless
  yieldStrength: number;    // N/m² (Pa)
  ultimateStrength: number; // N/m² (Pa)
}

export interface ThermalProperties {
  conductivity: number;     // W/(m·K)
  specificHeat: number;     // J/(kg·K)
}

/**
 * Value object representing calculated mass and weight outputs.
 * Follows immutability principles.
 */
export interface MaterialCalculatedProperties {
  mass: number;             // kg (requires length)
  weight: number;           // N (requires length)
  selfWeight: number;       // N (same as weight, semantic alias)
  linearMass: number;       // kg/m
  linearWeight: number;     // N/m
  surfaceMass?: number;     // kg/m² (future, for plates)
  surfaceWeight?: number;   // N/m² (future, for plates)
  volume: number;           // m³ (requires length)
  materialId: string;       // Source material reference
  densityUsed: number;      // kg/m³
}
