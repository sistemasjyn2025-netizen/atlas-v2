import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';

export class DimensionRenderer implements IEntityRenderer<DrawingEntity> {
    public render(entity: DrawingEntity, svgAttributes: string): string {
        return `<!-- Dimension Placeholder -->`;
    }
}
