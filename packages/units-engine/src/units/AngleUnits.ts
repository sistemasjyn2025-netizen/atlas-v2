import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const AngleUnits = {
  Radian: new Unit('rad', 'Radian', UnitFamily.Angle, UnitSystem.SI),
  Degree: new Unit('°', 'Degree', UnitFamily.Angle, UnitSystem.SI),
};
