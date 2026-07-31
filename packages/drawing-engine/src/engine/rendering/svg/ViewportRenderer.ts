import { Viewport } from '../../../domain/layout/Viewport';
import { LayerRenderer } from './LayerRenderer';

export class ViewportRenderer {
    private layerRenderer = new LayerRenderer();

    public render(viewport: Viewport): string {
        const { id, x, y, width, height, scale, viewId } = viewport;
        // The Viewport Renderer applies clipping, scaling, offsets, and transforms
        let svg = `<g id="${id}" transform="translate(${x}, ${y}) scale(${scale.ratio})">`;
        
        // Define clipping path for the viewport
        svg += `<clipPath id="clip-${id}">
                  <rect x="0" y="0" width="${width / scale.ratio}" height="${height / scale.ratio}" />
                </clipPath>`;
                
        svg += `<g clip-path="url(#clip-${id})">`;
        
        // Here we would lookup the actual DrawingView by viewId from the DocumentGraph or package
        // and render its entities using LayerRenderer.
        
        svg += `</g>`;
        svg += `</g>`;
        return svg;
    }
}
