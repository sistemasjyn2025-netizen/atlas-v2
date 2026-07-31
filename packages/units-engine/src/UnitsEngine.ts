import { Unit } from './Unit';
import { UnitFamily } from './types';
import { Quantity } from './Quantity';
import { ConversionRegistry } from './ConversionRegistry';
import { ConversionCache } from './ConversionCache';
import { UnitConverter } from './UnitConverter';
import { QuantityFormatter, FormatOptions } from './QuantityFormatter';
import { QuantityBuilder } from './builders/QuantityBuilder';

export class UnitsEngine {
  private registry: ConversionRegistry;
  private cache: ConversionCache;
  private converter: UnitConverter;

  constructor() {
    this.registry = new ConversionRegistry();
    this.cache = new ConversionCache();
    // Cache injection to UnitConverter could be done if needed, 
    // but the converter computes mathematically so fast it is O(1) anyway.
    // For completeness, we can optimize UnitConverter by passing the cache.
    // However, the formula (V*m1+o1-o2)/m2 is just 4 floating operations.
    this.converter = new UnitConverter(this.registry);
  }

  public getRegistry(): ConversionRegistry {
    return this.registry;
  }

  public convert<T extends Unit>(quantity: Quantity<any>, targetUnit: T): Quantity<T> {
    // If we want to use the cache for the overall factor:
    // Factor from U1 to U2 is not always linear if offsets are involved (like Temperatures).
    // So for safety and accuracy, we let the converter do the math.
    return this.converter.convert(quantity, targetUnit);
  }

  public isCompatible(unitA: Unit, unitB: Unit): boolean {
    return unitA.family === unitB.family;
  }

  public normalize(quantity: Quantity<any>): Quantity<any> {
    return this.converter.normalize(quantity);
  }

  public format(quantity: Quantity<any>, options?: FormatOptions): string {
    return QuantityFormatter.format(quantity, options);
  }

  public add<T extends Unit>(a: Quantity<T>, b: Quantity<any>): Quantity<T> {
    return this.converter.add(a, b);
  }

  public subtract<T extends Unit>(a: Quantity<T>, b: Quantity<any>): Quantity<T> {
    return this.converter.subtract(a, b);
  }

  public multiplyByScalar<T extends Unit>(q: Quantity<T>, scalar: number): Quantity<T> {
    return this.converter.multiplyByScalar(q, scalar);
  }

  public divideByScalar<T extends Unit>(q: Quantity<T>, scalar: number): Quantity<T> {
    return this.converter.divideByScalar(q, scalar);
  }

  public equals(a: Quantity<any>, b: Quantity<any>): boolean {
    return this.converter.equals(a, b);
  }

  public compare(a: Quantity<any>, b: Quantity<any>): number {
    return this.converter.compare(a, b);
  }

  public build<T extends Unit>(value: number, unit: T): Quantity<T> {
    return QuantityBuilder.build(value, unit);
  }
}
