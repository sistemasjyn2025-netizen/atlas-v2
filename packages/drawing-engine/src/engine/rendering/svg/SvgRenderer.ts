import { IDrawingRenderer } from '../IDrawingRenderer';
import { DrawingPackage } from '../../../domain/DrawingPackage';
import { SvgDocumentBuilder } from './SvgDocumentBuilder';

export class SvgRenderer implements IDrawingRenderer<string> {
    public async render(drawingPackage: DrawingPackage): Promise<string> {
        const builder = new SvgDocumentBuilder();
        
        // Render each sheet in the package. For now we assume one SVG per sheet,
        // or a single concatenated SVG. We'll return the first sheet for simplicity,
        // or combine them.
        const sheets = drawingPackage.getSheets();
        if (sheets.length === 0) {
            return builder.buildEmpty();
        }

        const primarySheet = sheets[0];
        return builder.buildSheet(primarySheet);
    }
}
