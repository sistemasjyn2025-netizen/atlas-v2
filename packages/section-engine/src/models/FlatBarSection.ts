import { StructuralSection } from './StructuralSection';
import { SectionShape, SectionFamily, ManufacturingMethod, SectionGeometry, Millimeters } from '../types';

export class FlatBarSection extends StructuralSection {
  constructor(
    id: string,
    code: string,
    name: string,
    family: SectionFamily,
    method: ManufacturingMethod,
    public readonly b: Millimeters,
    public readonly t: Millimeters,
    metadata: Record<string, unknown> = {}
  ) {
    super(id, code, name, SectionShape.FlatBar, family, method, metadata);
  }

  public getGeometry(): SectionGeometry {
    return { contours: { outer: { segments: [], isClosed: true }, inner: [] } };
  }

  protected compareDimensions(other: StructuralSection): boolean {
    if (!(other instanceof FlatBarSection)) return false;
    return this.b === other.b &&
           this.t === other.t;
  }

  protected serializeDimensions(): Record<string, number> {
    return { b: this.b, t: this.t };
  }
}
