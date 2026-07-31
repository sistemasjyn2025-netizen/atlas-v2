import { StructuralSection } from '@atlas/section-engine';
import { CalculatorRegistry } from './CalculatorRegistry';
import { PropertyCache } from './PropertyCache';
import { SectionProperties } from './types';
import { GenericCalculator } from './calculators';
import { CalculationError } from './errors';

export class PropertyEngine {
  constructor(
    public readonly registry: CalculatorRegistry,
    public readonly cache: PropertyCache
  ) {}

  /**
   * Calculates the geometric properties of a given structural section.
   * Leverages caching for deterministic dimensions.
   */
  public calculate(section: StructuralSection): SectionProperties {
    // 1. Check cache
    const cached = this.cache.get(section);
    if (cached) {
      return cached;
    }

    // 2. Locate specialized calculator
    let calculator = this.registry.get(section.shape);
    if (!calculator) {
      // Fallback to generic which will throw CalculatorNotFoundError
      calculator = new GenericCalculator();
    }

    // 3. Compute
    try {
      const properties = calculator.calculate(section);
      
      // 4. Cache and return
      this.cache.set(section, properties);
      return properties;
    } catch (error: any) {
      if (error.name === 'CalculatorNotFoundError' || error.name === 'InvalidDimensionsError') {
        throw error;
      }
      throw new CalculationError(`Failed to calculate properties for ${section.code}: ${error.message}`);
    }
  }
}
