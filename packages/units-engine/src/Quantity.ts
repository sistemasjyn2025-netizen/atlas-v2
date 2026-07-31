import { Unit } from './Unit';
import { UnitFamily } from './types';

/**
 * Immutable Value Object representing a physical magnitude.
 * Contains purely data. All mathematical operations are performed
 * via the UnitConverter to maintain architectural purity.
 */
export class Quantity<TUnit extends Unit = Unit> {
  constructor(
    public readonly value: number,
    public readonly unit: TUnit
  ) {}

  public get family(): UnitFamily {
    return this.unit.family;
  }
}
