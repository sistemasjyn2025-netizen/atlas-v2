import {
  MaterialCategory,
  MaterialFamily,
  PhysicalProperties,
  MechanicalProperties,
  ThermalProperties
} from './types';

/**
 * Base abstract class for all materials in ATLAS.
 * Represents purely physical and mechanical domain behaviors.
 */
export abstract class Material {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly family: MaterialFamily,
    public readonly category: MaterialCategory,
    public readonly description: string,
    public readonly physical: PhysicalProperties,
    public readonly mechanical: MechanicalProperties,
    public readonly thermal: ThermalProperties,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  /**
   * Helper to check equality based on the unique ID.
   */
  public equals(other: Material): boolean {
    return this.id === other.id;
  }
}
