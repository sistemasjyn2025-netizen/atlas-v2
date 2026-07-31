import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const MassUnits = {
  Gram: new Unit('g', 'Gram', UnitFamily.Mass, UnitSystem.SI),
  Kilogram: new Unit('kg', 'Kilogram', UnitFamily.Mass, UnitSystem.SI),
  Ton: new Unit('ton', 'Ton', UnitFamily.Mass, UnitSystem.SI),
};
