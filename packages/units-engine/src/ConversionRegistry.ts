import { Unit } from './Unit';
import { UnitFamily } from './types';
import { UnitNotFoundError } from './errors';

export class ConversionRegistry {
  private baseUnits = new Map<UnitFamily, Unit>();
  private multipliers = new Map<string, number>();
  private offsets = new Map<string, number>();

  public registerBaseUnit(family: UnitFamily, unit: Unit): void {
    this.baseUnits.set(family, unit);
    this.multipliers.set(unit.symbol, 1.0);
    this.offsets.set(unit.symbol, 0.0);
  }

  public registerUnit(unit: Unit, multiplierToBase: number, offsetToBase: number = 0.0): void {
    if (!this.baseUnits.has(unit.family)) {
      throw new Error(`Base unit for family ${unit.family} is not registered.`);
    }
    this.multipliers.set(unit.symbol, multiplierToBase);
    this.offsets.set(unit.symbol, offsetToBase);
  }

  public getBaseUnit(family: UnitFamily): Unit {
    const base = this.baseUnits.get(family);
    if (!base) {
      throw new UnitNotFoundError(`No base unit registered for family ${family}`);
    }
    return base;
  }

  public getMultiplierToBase(unit: Unit): number {
    const mult = this.multipliers.get(unit.symbol);
    if (mult === undefined) {
      throw new UnitNotFoundError(`Unit ${unit.symbol} is not registered in the ConversionRegistry.`);
    }
    return mult;
  }

  public getOffsetToBase(unit: Unit): number {
    return this.offsets.get(unit.symbol) || 0.0;
  }
}
