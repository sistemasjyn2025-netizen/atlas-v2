import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';

export class PolylineRenderer implements IEntityRenderer<DrawingEntity> {
    public render(entity: DrawingEntity, svgAttributes: string): string {
        return `<polyline points="0,0 10,10 20,0" ${svgAttributes} />`;
    }
}
