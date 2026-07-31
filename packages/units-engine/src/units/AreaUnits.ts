import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const AreaUnits = {
  SquareMillimeter: new Unit('mm²', 'Square Millimeter', UnitFamily.Area, UnitSystem.SI),
  SquareCentimeter: new Unit('cm²', 'Square Centimeter', UnitFamily.Area, UnitSystem.SI),
  SquareMeter: new Unit('m²', 'Square Meter', UnitFamily.Area, UnitSystem.SI),
};
