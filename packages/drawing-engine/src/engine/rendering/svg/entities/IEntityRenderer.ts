import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';

export interface IEntityRenderer<T extends DrawingEntity> {
    render(entity: T, svgAttributes: string): string;
}
