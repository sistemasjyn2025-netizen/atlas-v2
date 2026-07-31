import { Unit } from './Unit';

export class ConversionCache {
  private cache = new Map<string, number>();

  public getFactor(from: Unit, to: Unit): number | undefined {
    return this.cache.get(`${from.symbol}_${to.symbol}`);
  }

  public setFactor(from: Unit, to: Unit, factor: number): void {
    this.cache.set(`${from.symbol}_${to.symbol}`, factor);
  }

  public clear(): void {
    this.cache.clear();
  }
}
