export class CalculatorNotFoundError extends Error {
  constructor(message: string) {
    super(`Calculator Not Found: ${message}`);
    this.name = 'CalculatorNotFoundError';
  }
}

export class InvalidSectionError extends Error {
  constructor(message: string) {
    super(`Invalid Section: ${message}`);
    this.name = 'InvalidSectionError';
  }
}

export class InvalidDimensionsError extends Error {
  constructor(message: string) {
    super(`Invalid Dimensions: ${message}`);
    this.name = 'InvalidDimensionsError';
  }
}

export class CalculationError extends Error {
  constructor(message: string) {
    super(`Calculation Error: ${message}`);
    this.name = 'CalculationError';
  }
}
