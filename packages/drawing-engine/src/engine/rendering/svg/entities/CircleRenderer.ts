import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';

export class CircleRenderer implements IEntityRenderer<DrawingEntity> {
    public render(entity: DrawingEntity, svgAttributes: string): string {
        return `<circle cx="0" cy="0" r="10" ${svgAttributes} />`;
    }
}
