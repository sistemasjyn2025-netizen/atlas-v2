import { UnitFamily, UnitSystem } from './types';

export class Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly family: UnitFamily,
    public readonly system: UnitSystem
  ) {}

  public equals(other: Unit): boolean {
    return this.symbol === other.symbol && this.family === other.family;
  }
}
