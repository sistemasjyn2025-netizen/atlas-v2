import { StructuralSection } from './StructuralSection';
import { SectionShape, SectionFamily, ManufacturingMethod, SectionGeometry, Millimeters } from '../types';

export class PipeSection extends StructuralSection {
  constructor(
    id: string,
    code: string,
    name: string,
    family: SectionFamily,
    method: ManufacturingMethod,
    public readonly d: Millimeters,
    public readonly t: Millimeters,
    metadata: Record<string, unknown> = {}
  ) {
    super(id, code, name, SectionShape.Pipe, family, method, metadata);
  }

  public getGeometry(): SectionGeometry {
    return { contours: { outer: { segments: [], isClosed: true }, inner: [] } };
  }

  protected compareDimensions(other: StructuralSection): boolean {
    if (!(other instanceof PipeSection)) return false;
    return this.d === other.d &&
           this.t === other.t;
  }

  protected serializeDimensions(): Record<string, number> {
    return { d: this.d, t: this.t };
  }
}
