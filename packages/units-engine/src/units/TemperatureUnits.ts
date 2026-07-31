import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const TemperatureUnits = {
  Celsius: new Unit('°C', 'Celsius', UnitFamily.Temperature, UnitSystem.SI),
  Kelvin: new Unit('K', 'Kelvin', UnitFamily.Temperature, UnitSystem.SI),
};
