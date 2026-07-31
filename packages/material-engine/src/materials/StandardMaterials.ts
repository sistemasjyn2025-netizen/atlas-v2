import { MaterialBuilder } from '../builders';
import { PhysicalProperties, MechanicalProperties, ThermalProperties } from '../types';

const g = 9.80665; // Gravity m/s² for specific weight (N/m³)

// ---------------------------------------------------------
// STEEL (SI units: m, kg, N, Pa)
// ---------------------------------------------------------
const steelPhysical: PhysicalProperties = { density: 7850, specificWeight: 7850 * g, thermalExpansion: 1.2e-5 };
const steelThermal: ThermalProperties = { conductivity: 50, specificHeat: 450 };

export const SteelS235 = MaterialBuilder.buildSteel(
  'mat-steel-s235', 'S235', 'Steel S235', 'Standard Structural Steel S235',
  steelPhysical,
  { youngModulus: 2.1e11, shearModulus: 8.07e10, poisson: 0.3, yieldStrength: 2.35e8, ultimateStrength: 3.60e8 },
  steelThermal
);

export const SteelS275 = MaterialBuilder.buildSteel(
  'mat-steel-s275', 'S275', 'Steel S275', 'Standard Structural Steel S275',
  steelPhysical,
  { youngModulus: 2.1e11, shearModulus: 8.07e10, poisson: 0.3, yieldStrength: 2.75e8, ultimateStrength: 4.10e8 },
  steelThermal
);

export const SteelS355 = MaterialBuilder.buildSteel(
  'mat-steel-s355', 'S355', 'Steel S355', 'High Strength Structural Steel S355',
  steelPhysical,
  { youngModulus: 2.1e11, shearModulus: 8.07e10, poisson: 0.3, yieldStrength: 3.55e8, ultimateStrength: 4.70e8 },
  steelThermal
);

// ---------------------------------------------------------
// CONCRETE
// ---------------------------------------------------------
const concretePhysical: PhysicalProperties = { density: 2500, specificWeight: 2500 * g, thermalExpansion: 1.0e-5 };
const concreteThermal: ThermalProperties = { conductivity: 1.5, specificHeat: 1000 };

export const ConcreteC25 = MaterialBuilder.buildConcrete(
  'mat-conc-c25', 'C25/30', 'Concrete C25/30', 'Standard Concrete C25',
  concretePhysical,
  { youngModulus: 3.1e10, shearModulus: 1.29e10, poisson: 0.2, yieldStrength: 2.5e7, ultimateStrength: 3.0e7 }, // fck
  concreteThermal
);

export const ConcreteC30 = MaterialBuilder.buildConcrete(
  'mat-conc-c30', 'C30/37', 'Concrete C30/37', 'Standard Concrete C30',
  concretePhysical,
  { youngModulus: 3.3e10, shearModulus: 1.37e10, poisson: 0.2, yieldStrength: 3.0e7, ultimateStrength: 3.7e7 },
  concreteThermal
);

// ---------------------------------------------------------
// ALUMINUM
// ---------------------------------------------------------
export const Aluminum6061 = MaterialBuilder.buildAluminum(
  'mat-alu-6061', '6061-T6', 'Aluminum 6061-T6', 'Structural Aluminum Alloy',
  { density: 2700, specificWeight: 2700 * g, thermalExpansion: 2.3e-5 },
  { youngModulus: 6.9e10, shearModulus: 2.6e10, poisson: 0.33, yieldStrength: 2.76e8, ultimateStrength: 3.10e8 },
  { conductivity: 167, specificHeat: 896 }
);

// ---------------------------------------------------------
// TIMBER
// ---------------------------------------------------------
export const TimberGL24 = MaterialBuilder.buildTimber(
  'mat-timb-gl24', 'GL24', 'Glulam GL24', 'Glued Laminated Timber',
  { density: 400, specificWeight: 400 * g, thermalExpansion: 5.0e-6 }, // approx
  { youngModulus: 1.1e10, shearModulus: 6.9e8, poisson: 0.4, yieldStrength: 2.4e7, ultimateStrength: 2.4e7 }, // approx bending strength
  { conductivity: 0.13, specificHeat: 1600 }
);

export const StandardMaterials = [
  SteelS235, SteelS275, SteelS355,
  ConcreteC25, ConcreteC30,
  Aluminum6061,
  TimberGL24
];
