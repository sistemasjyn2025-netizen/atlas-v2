export class IncompatibleUnitsError extends Error {
  constructor(message: string) {
    super(`Incompatible Units: ${message}`);
    this.name = 'IncompatibleUnitsError';
  }
}

export class UnitNotFoundError extends Error {
  constructor(message: string) {
    super(`Unit Not Found: ${message}`);
    this.name = 'UnitNotFoundError';
  }
}

export class InvalidQuantityError extends Error {
  constructor(message: string) {
    super(`Invalid Quantity: ${message}`);
    this.name = 'InvalidQuantityError';
  }
}
