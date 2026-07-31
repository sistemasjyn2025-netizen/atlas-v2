import { DrawingSheet } from '../../../domain/layout/DrawingSheet';
import { ViewportRenderer } from './ViewportRenderer';

export class SvgDocumentBuilder {
    private viewportRenderer = new ViewportRenderer();

    public buildEmpty(): string {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"></svg>`;
    }

    public buildSheet(sheet: DrawingSheet): string {
        const width = sheet.paperFormat.width;
        const height = sheet.paperFormat.height;
        
        // Prepare for infinite zoom
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">`;
        
        // Background
        svg += `<rect width="100%" height="100%" fill="white" />`;

        for (const viewport of sheet.getViewports()) {
            svg += this.viewportRenderer.render(viewport);
        }

        // We also need to render TitleBlock and Revisions here, but keeping it minimal for now.

        svg += `</svg>`;
        return svg;
    }
}
