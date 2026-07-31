export class InvalidGeometryError extends Error {
  constructor(message: string) {
    super(`Invalid Geometry: ${message}`);
    this.name = 'InvalidGeometryError';
  }
}
