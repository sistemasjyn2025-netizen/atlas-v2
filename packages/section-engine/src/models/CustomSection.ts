import { StructuralSection } from './StructuralSection';
import { SectionShape, SectionFamily, ManufacturingMethod, SectionGeometry, Millimeters } from '../types';

export class CustomSection extends StructuralSection {
  constructor(
    id: string,
    code: string,
    name: string,
    family: SectionFamily,
    method: ManufacturingMethod,
    public readonly customDimensions: Record<string, Millimeters>,
    metadata: Record<string, unknown> = {}
  ) {
    super(id, code, name, SectionShape.Custom, family, method, metadata);
  }

  public getGeometry(): SectionGeometry {
    return { contours: { outer: { segments: [], isClosed: true }, inner: [] } };
  }

  protected compareDimensions(other: StructuralSection): boolean {
    if (!(other instanceof CustomSection)) return false;
    
    const thisKeys = Object.keys(this.customDimensions);
    const otherKeys = Object.keys(other.customDimensions);
    
    if (thisKeys.length !== otherKeys.length) return false;
    
    for (const key of thisKeys) {
      if (this.customDimensions[key] !== other.customDimensions[key]) return false;
    }
    
    return true;
  }

  protected serializeDimensions(): Record<string, number> {
    return { ...this.customDimensions };
  }
}
