import { Unit } from '../Unit';
import { Quantity } from '../Quantity';
import { InvalidQuantityError } from '../errors';

export class QuantityBuilder {
  public static build<T extends Unit>(value: number, unit: T): Quantity<T> {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
      throw new InvalidQuantityError(`Cannot create quantity with invalid numeric value: ${value}`);
    }
    
    if (!unit) {
      throw new InvalidQuantityError('Cannot create quantity without a valid unit.');
    }

    return new Quantity<T>(value, unit);
  }
}
