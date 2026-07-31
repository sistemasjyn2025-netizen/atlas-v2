import { StructuralSection } from '@atlas/section-engine';
import { PropertyCalculator } from './PropertyCalculator';
import { SectionProperties } from '../types';
import { CalculatorNotFoundError } from '../errors';

export class GenericCalculator implements PropertyCalculator<StructuralSection> {
  public readonly type = 'Generic';

  public calculate(section: StructuralSection): SectionProperties {
    throw new CalculatorNotFoundError(`No property calculator implemented for shape: ${section.shape}`);
  }
}
