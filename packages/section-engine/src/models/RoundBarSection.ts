import { StructuralSection } from './StructuralSection';
import { SectionShape, SectionFamily, ManufacturingMethod, SectionGeometry, Millimeters } from '../types';

export class RoundBarSection extends StructuralSection {
  constructor(
    id: string,
    code: string,
    name: string,
    family: SectionFamily,
    method: ManufacturingMethod,
    public readonly d: Millimeters,
    metadata: Record<string, unknown> = {}
  ) {
    super(id, code, name, SectionShape.RoundBar, family, method, metadata);
  }

  public getGeometry(): SectionGeometry {
    return { contours: { outer: { segments: [], isClosed: true }, inner: [] } };
  }

  protected compareDimensions(other: StructuralSection): boolean {
    if (!(other instanceof RoundBarSection)) return false;
    return this.d === other.d;
  }

  protected serializeDimensions(): Record<string, number> {
    return { d: this.d };
  }
}
