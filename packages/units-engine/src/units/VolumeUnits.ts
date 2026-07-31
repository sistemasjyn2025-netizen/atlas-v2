import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const VolumeUnits = {
  CubicMillimeter: new Unit('mm³', 'Cubic Millimeter', UnitFamily.Volume, UnitSystem.SI),
  CubicCentimeter: new Unit('cm³', 'Cubic Centimeter', UnitFamily.Volume, UnitSystem.SI),
  CubicMeter: new Unit('m³', 'Cubic Meter', UnitFamily.Volume, UnitSystem.SI),
};
