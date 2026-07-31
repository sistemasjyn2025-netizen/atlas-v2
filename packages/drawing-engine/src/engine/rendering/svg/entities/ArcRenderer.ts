import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';

export class ArcRenderer implements IEntityRenderer<DrawingEntity> {
    public render(entity: DrawingEntity, svgAttributes: string): string {
        return `<path d="M 0 0 A 10 10 0 0 1 10 10" ${svgAttributes} />`;
    }
}
