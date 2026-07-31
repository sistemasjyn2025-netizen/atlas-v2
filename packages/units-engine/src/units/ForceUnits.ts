import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const ForceUnits = {
  Newton: new Unit('N', 'Newton', UnitFamily.Force, UnitSystem.SI),
  Kilonewton: new Unit('kN', 'Kilonewton', UnitFamily.Force, UnitSystem.SI),
  Meganewton: new Unit('MN', 'Meganewton', UnitFamily.Force, UnitSystem.SI),
};
