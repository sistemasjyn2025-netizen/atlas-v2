import { AnalyticalGeometry, DrawableGeometry } from '../geometry/Geometry';

export class DrawingEntity {
  constructor(
    public readonly id: string,
    public readonly layerId: string,
    public readonly styleId: string,
    public readonly drawableGeometry: DrawableGeometry,
    public readonly analyticalGeometry?: AnalyticalGeometry
  ) {}
}
