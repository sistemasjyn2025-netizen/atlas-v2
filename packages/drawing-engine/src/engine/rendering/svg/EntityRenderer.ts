import { DrawingEntity } from '../../../domain/entities/DrawingEntity';
import { StyleResolver } from './StyleResolver';

export class EntityRenderer {
    private styleResolver = new StyleResolver();

    public render(entity: DrawingEntity): string {
        const svgAttributes = this.styleResolver.resolve(entity.styleId);
        // Delegate to specific renderers based on entity type.
        // E.g., LineRenderer, PolylineRenderer, etc.
        // For now, we return a comment placeholder.
        return `<!-- Rendered Entity: ${entity.id} with class ${entity.styleId} -->`;
    }
}
