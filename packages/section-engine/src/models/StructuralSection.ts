import { SectionShape, SectionFamily, ManufacturingMethod, SectionGeometry } from '../types';

/**
 * The canonical base model for any structural section in ATLAS.
 * 
 * Note: This model represents the purely topological definition of the section.
 * Future integration points:
 * - Property Engine: Will calculate area, inertia, section modulus, etc.
 * - Manufacturing Engine: Will consume this for BOM and cuts.
 * - Viewer / FEM: Will use the geometry adapter for 3D meshes.
 */
export abstract class StructuralSection {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly shape: SectionShape,
    public readonly family: SectionFamily,
    public readonly manufacturingMethod: ManufacturingMethod,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  /**
   * Generates the canonical topological geometry for this section.
   * To be implemented by specific section classes and consumed by the Geometry Engine.
   */
  public abstract getGeometry(): SectionGeometry;

  /**
   * Evaluates deep equality between this section and another.
   */
  public equals(other: StructuralSection): boolean {
    if (this === other) return true;
    if (this.shape !== other.shape) return false;
    
    // Derived classes should override to compare their specific dimensions.
    return this.compareDimensions(other);
  }

  /**
   * Dimension comparison hook for subclasses.
   */
  protected abstract compareDimensions(other: StructuralSection): boolean;

  /**
   * Serializes the section to a canonical JSON representation.
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      shape: this.shape,
      family: this.family,
      manufacturingMethod: this.manufacturingMethod,
      metadata: this.metadata,
      dimensions: this.serializeDimensions()
    };
  }

  /**
   * Dimension serialization hook for subclasses.
   */
  protected abstract serializeDimensions(): Record<string, number>;
}
