import { DrawingEntity } from './DrawingEntity';

export class DimensionEntity extends DrawingEntity {
  constructor(
    id: string,
    layerId: string,
    styleId: string,
    public readonly measureValue: number,
    public readonly dimensionText: string,
    public readonly startPoint: { x: number, y: number },
    public readonly endPoint: { x: number, y: number }
  ) {
    super(id, layerId, styleId, { type: 'Dimension' });
  }
}

export class AnnotationEntity extends DrawingEntity {
  constructor(
    id: string,
    layerId: string,
    styleId: string,
    public readonly text: string,
    public readonly position: { x: number, y: number }
  ) {
    super(id, layerId, styleId, { type: 'Annotation' });
  }
}

export class CenterlineEntity extends DrawingEntity {
  constructor(
    id: string,
    layerId: string,
    styleId: string,
    public readonly startPoint: { x: number, y: number },
    public readonly endPoint: { x: number, y: number }
  ) {
    super(id, layerId, styleId, { type: 'Centerline' });
  }
}

export class GridEntity extends DrawingEntity {
  constructor(
    id: string,
    layerId: string,
    styleId: string,
    public readonly label: string,
    public readonly startPoint: { x: number, y: number },
    public readonly endPoint: { x: number, y: number }
  ) {
    super(id, layerId, styleId, { type: 'Grid' });
  }
}

export class LeaderEntity extends DrawingEntity {
  constructor(
    id: string,
    layerId: string,
    styleId: string,
    public readonly points: { x: number, y: number }[],
    public readonly label: string
  ) {
    super(id, layerId, styleId, { type: 'Leader' });
  }
}
