import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const LengthUnits = {
  Millimeter: new Unit('mm', 'Millimeter', UnitFamily.Length, UnitSystem.SI),
  Centimeter: new Unit('cm', 'Centimeter', UnitFamily.Length, UnitSystem.SI),
  Meter: new Unit('m', 'Meter', UnitFamily.Length, UnitSystem.SI),
  Kilometer: new Unit('km', 'Kilometer', UnitFamily.Length, UnitSystem.SI),
  Inch: new Unit('in', 'Inch', UnitFamily.Length, UnitSystem.Imperial),
  Foot: new Unit('ft', 'Foot', UnitFamily.Length, UnitSystem.Imperial),
};
