import { IDrawingRenderer } from '../IDrawingRenderer';
import { DrawingPackage } from '../../../domain/DrawingPackage';
import { DrawingSheet } from '../../../domain/layout/DrawingSheet';
import { CenterlineEntity, AnnotationEntity } from '../../../domain/entities/SpecificEntities';

export class DxfRenderer implements IDrawingRenderer<string> {
    public async render(drawingPackage: DrawingPackage): Promise<string> {
        const sheets = drawingPackage.getSheets();
        if (sheets.length === 0) {
            return this.buildEmptyDxf();
        }

        const primarySheet = sheets[0];
        return this.buildSheetDxf(primarySheet);
    }

    private buildEmptyDxf(): string {
        return `  0\nSECTION\n  2\nENTITIES\n  0\nENDSEC\n  0\nEOF\n`;
    }

    private buildSheetDxf(sheet: DrawingSheet): string {
        let dxf = `  0\nSECTION\n  2\nHEADER\n  0\nENDSEC\n  0\nSECTION\n  2\nENTITIES\n`;

        // We will output a basic rectangle for the sheet frame
        const w = sheet.paperFormat.width;
        const h = sheet.paperFormat.height;
        dxf += this.createLine(0, 0, w, 0);
        dxf += this.createLine(w, 0, w, h);
        dxf += this.createLine(w, h, 0, h);
        dxf += this.createLine(0, h, 0, 0);

        for (const vp of sheet.getViewports()) {
            // For MVP DXF, we just draw the viewport bounds since we don't have direct access
            // to the View object unless we fetch it from the DocumentSession.
            // But we can just draw the viewport rectangle to prove DXF export works.
            dxf += this.createLine(vp.x, vp.y, vp.x + vp.width, vp.y);
            dxf += this.createLine(vp.x + vp.width, vp.y, vp.x + vp.width, vp.y + vp.height);
            dxf += this.createLine(vp.x + vp.width, vp.y + vp.height, vp.x, vp.y + vp.height);
            dxf += this.createLine(vp.x, vp.y + vp.height, vp.x, vp.y);
            dxf += this.createText(vp.x + 10, vp.y + 10, `Viewport ${vp.viewId}`);
        }

        dxf += `  0\nENDSEC\n  0\nEOF\n`;
        return dxf;
    }

    private createLine(x1: number, y1: number, x2: number, y2: number): string {
        return `  0\nLINE\n  8\n0\n 10\n${x1}\n 20\n${y1}\n 30\n0.0\n 11\n${x2}\n 21\n${y2}\n 31\n0.0\n`;
    }

    private createText(x: number, y: number, content: string): string {
        return `  0\nTEXT\n  8\n0\n 10\n${x}\n 20\n${y}\n 30\n0.0\n 40\n10.0\n  1\n${content}\n`;
    }
}
