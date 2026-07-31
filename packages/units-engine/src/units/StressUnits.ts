import { Unit } from '../Unit';
import { UnitFamily, UnitSystem } from '../types';

export const StressUnits = {
  Pascal: new Unit('Pa', 'Pascal', UnitFamily.Stress, UnitSystem.SI),
  Kilopascal: new Unit('kPa', 'Kilopascal', UnitFamily.Stress, UnitSystem.SI),
  Megapascal: new Unit('MPa', 'Megapascal', UnitFamily.Stress, UnitSystem.SI),
  Gigapascal: new Unit('GPa', 'Gigapascal', UnitFamily.Stress, UnitSystem.SI),
};
