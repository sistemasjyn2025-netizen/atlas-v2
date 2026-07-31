/**
 * Represents the status of compatibility validation.
 */
export interface CompatibilityResult {
  isCompatible: boolean;
  errors: string[];
  warnings: string[];
}
