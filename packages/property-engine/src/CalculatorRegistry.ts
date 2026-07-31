import { SectionShape, StructuralSection } from '@atlas/section-engine';
import { PropertyCalculator } from './calculators';

export class CalculatorRegistry {
  private calculators: Map<SectionShape, PropertyCalculator<any>> = new Map();

  public register(shape: SectionShape, calculator: PropertyCalculator<any>): void {
    this.calculators.set(shape, calculator);
  }

  public unregister(shape: SectionShape): void {
    this.calculators.delete(shape);
  }

  public get(shape: SectionShape): PropertyCalculator<any> | undefined {
    return this.calculators.get(shape);
  }

  public exists(shape: SectionShape): boolean {
    return this.calculators.has(shape);
  }

  public list(): SectionShape[] {
    return Array.from(this.calculators.keys());
  }
}
