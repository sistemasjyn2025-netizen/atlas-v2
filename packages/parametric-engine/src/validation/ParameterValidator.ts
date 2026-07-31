import { IndustrialBuildingParameters } from '../parameters';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ParameterValidator {
  public validateIndustrialBuilding(params: IndustrialBuildingParameters): ValidationResult {
    const errors: string[] = [];

    if (!params.width || params.width <= 0) errors.push('Width must be greater than 0.');
    if (!params.length || params.length <= 0) errors.push('Length must be greater than 0.');
    if (!params.height || params.height <= 0) errors.push('Height must be greater than 0.');
    if (!params.baySpacing || params.baySpacing <= 0) errors.push('Bay spacing must be greater than 0.');
    
    if (params.baySpacing > params.length) {
      errors.push('Bay spacing cannot be greater than the total length of the building.');
    }

    if (params.roofType === 'gable' && (params.roofSlope < 0 || params.roofSlope > 60)) {
      errors.push('Gable roof slope must be between 0 and 60 degrees.');
    }

    if (!params.structuralProfile || params.structuralProfile.trim() === '') {
      errors.push('Structural profile must be specified.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
