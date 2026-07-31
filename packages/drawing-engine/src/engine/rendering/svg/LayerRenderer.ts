import { DrawingView } from '../../../domain/layout/DrawingView';
import { EntityRenderer } from './EntityRenderer';

export class LayerRenderer {
    private entityRenderer = new EntityRenderer();

    public render(view: DrawingView): string {
        let svg = `<g id="view-${view.id}">`;
        
        // Group by layers or iterate all entities
        for (const entity of view.getEntities()) {
            svg += this.entityRenderer.render(entity);
        }

        svg += `</g>`;
        return svg;
    }
}
