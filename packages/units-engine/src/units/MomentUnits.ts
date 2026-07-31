import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const MomentUnits = {
  NewtonMeter: new Unit('N·m', 'Newton Meter', UnitFamily.Moment, UnitSystem.SI),
  KilonewtonMeter: new Unit('kN·m', 'Kilonewton Meter', UnitFamily.Moment, UnitSystem.SI),
};
