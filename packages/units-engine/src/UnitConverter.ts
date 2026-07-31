import { Unit } from './Unit';
import { UnitFamily } from './types';
import { ConversionRegistry } from './ConversionRegistry';
import { Quantity } from './Quantity';
import { IncompatibleUnitsError } from './errors';
import { QuantityBuilder } from './builders/QuantityBuilder';

export class UnitConverter {
  constructor(private registry: ConversionRegistry) {}

  public convert<T extends Unit>(quantity: Quantity<any>, targetUnit: T): Quantity<T> {
    if (quantity.family !== targetUnit.family) {
      throw new IncompatibleUnitsError(`Cannot convert ${quantity.family} to ${targetUnit.family}`);
    }

    if (quantity.unit.equals(targetUnit)) {
      return QuantityBuilder.build(quantity.value, targetUnit);
    }

    const m1 = this.registry.getMultiplierToBase(quantity.unit);
    const o1 = this.registry.getOffsetToBase(quantity.unit);

    const m2 = this.registry.getMultiplierToBase(targetUnit);
    const o2 = this.registry.getOffsetToBase(targetUnit);

    // Value in base unit
    const baseValue = quantity.value * m1 + o1;

    // Value in target unit
    const targetValue = (baseValue - o2) / m2;

    return QuantityBuilder.build(targetValue, targetUnit);
  }

  public normalize(quantity: Quantity<any>): Quantity<any> {
    const baseUnit = this.registry.getBaseUnit(quantity.family);
    return this.convert(quantity, baseUnit);
  }

  public add<T extends Unit>(a: Quantity<T>, b: Quantity<any>): Quantity<T> {
    const bConverted = this.convert(b, a.unit);
    return QuantityBuilder.build(a.value + bConverted.value, a.unit);
  }

  public subtract<T extends Unit>(a: Quantity<T>, b: Quantity<any>): Quantity<T> {
    const bConverted = this.convert(b, a.unit);
    return QuantityBuilder.build(a.value - bConverted.value, a.unit);
  }

  public multiplyByScalar<T extends Unit>(q: Quantity<T>, scalar: number): Quantity<T> {
    return QuantityBuilder.build(q.value * scalar, q.unit);
  }

  public divideByScalar<T extends Unit>(q: Quantity<T>, scalar: number): Quantity<T> {
    return QuantityBuilder.build(q.value / scalar, q.unit);
  }

  public equals(a: Quantity<any>, b: Quantity<any>): boolean {
    if (a.family !== b.family) return false;
    const bConverted = this.convert(b, a.unit);
    // Use an epsilon for float comparison due to conversion drift
    return Math.abs(a.value - bConverted.value) < 1e-10;
  }

  public compare(a: Quantity<any>, b: Quantity<any>): number {
    if (a.family !== b.family) {
      throw new IncompatibleUnitsError(`Cannot compare ${a.family} with ${b.family}`);
    }
    const bConverted = this.convert(b, a.unit);
    const diff = a.value - bConverted.value;
    if (Math.abs(diff) < 1e-10) return 0;
    return diff > 0 ? 1 : -1;
  }
}
