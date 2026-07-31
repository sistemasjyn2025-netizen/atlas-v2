import { StructuralSection } from './StructuralSection';
import { SectionShape, SectionFamily, ManufacturingMethod, SectionGeometry, Millimeters } from '../types';

export class ChannelSection extends StructuralSection {
  constructor(
    id: string,
    code: string,
    name: string,
    family: SectionFamily,
    method: ManufacturingMethod,
    public readonly h: Millimeters,
    public readonly b: Millimeters,
    public readonly tw: Millimeters,
    public readonly tf: Millimeters,
    public readonly r?: Millimeters,
    metadata: Record<string, unknown> = {}
  ) {
    super(id, code, name, SectionShape.Channel, family, method, metadata);
  }

  public getGeometry(): SectionGeometry {
    return { contours: { outer: { segments: [], isClosed: true }, inner: [] } };
  }

  protected compareDimensions(other: StructuralSection): boolean {
    if (!(other instanceof ChannelSection)) return false;
    return this.h === other.h &&
           this.b === other.b &&
           this.tw === other.tw &&
           this.tf === other.tf &&
           this.r === other.r;
  }

  protected serializeDimensions(): Record<string, number> {
    const dims: Record<string, number> = { h: this.h, b: this.b, tw: this.tw, tf: this.tf };
    if (this.r !== undefined) dims.r = this.r;
    return dims;
  }
}
