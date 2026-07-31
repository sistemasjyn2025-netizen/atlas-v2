import { StructuralSection } from '@atlas/section-engine';
import { SectionProperties } from '../types';

/**
 * Base interface for any property calculator (Analytical, FEM, LookupTable).
 * Currently implemented purely as Analytical (idealized geometry) for v1.0.
 */
export interface PropertyCalculator<T extends StructuralSection = StructuralSection> {
  /**
   * Identifies the type/provider of the calculator.
   */
  readonly type: 'Analytical' | 'LookupTable' | 'FEM' | 'Generic';

  /**
   * Pure mathematical function that calculates properties for a given section.
   */
  calculate(section: T): SectionProperties;
}
