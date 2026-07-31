import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';

export class HatchRenderer implements IEntityRenderer<DrawingEntity> {
    public render(entity: DrawingEntity, svgAttributes: string): string {
        return `<!-- Hatch Placeholder -->`;
    }
}
