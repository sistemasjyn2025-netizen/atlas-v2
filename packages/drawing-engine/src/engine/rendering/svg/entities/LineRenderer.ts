import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';

export class LineRenderer implements IEntityRenderer<DrawingEntity> {
    public render(entity: DrawingEntity, svgAttributes: string): string {
        // Mock line rendering. Requires actual start/end point data from the entity.
        return `<line x1="0" y1="0" x2="10" y2="10" ${svgAttributes} />`;
    }
}
