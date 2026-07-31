export interface PaperFormat { width: number; height: number; }
export interface TitleBlock { x: number; y: number; width: number; height: number; fields: any; }
export interface ProjectedGeometry {
  calculateBoundingBox(scale: number): { width: number; height: number };
}
export interface DrawingView {
  id: string;
  alignmentTargetId?: string;
  viewport: { x: number; y: number; scale: number };
  projectedGeometry: ProjectedGeometry;
}
export interface DrawingSheet {
  id: string;
  name: string;
  format: PaperFormat;
  titleBlock: TitleBlock;
  views: DrawingView[];
  entities: any[];
}

export class SheetComposer {
  private readonly MARGIN = 15;
  
  public compose(format: PaperFormat, rawViews: DrawingView[], projectData: any): DrawingSheet {
    const titleBlock = this.generateTitleBlock(format, projectData);
    
    const sheet: DrawingSheet = {
      id: `sheet_${Date.now()}`,
      name: 'Plano General de Montaje',
      format,
      titleBlock,
      views: [],
      entities: []
    };

    const optimalScale = this.calculateOptimalScale(rawViews, format);
    sheet.views = this.packViews(rawViews, optimalScale, format, sheet.titleBlock);
    return sheet;
  }

  public calculateOptimalScale(views: DrawingView[], format: PaperFormat): number {
    const standardScales = [10, 20, 50, 75, 100, 200, 500];
    const availW = format.width - this.MARGIN * 2;
    const availH = format.height - this.MARGIN * 2;
    const availableArea = availW * availH;

    for (const scale of standardScales) {
      let requiredArea = 0;
      let maxViewW = 0;
      let maxViewH = 0;
      
      for (const view of views) {
        const scaledBox = view.projectedGeometry.calculateBoundingBox(1 / scale);
        requiredArea += (scaledBox.width * scaledBox.height) * 1.2;
        if (scaledBox.width > maxViewW) maxViewW = scaledBox.width;
        if (scaledBox.height > maxViewH) maxViewH = scaledBox.height;
      }
      
      // Heurística de área y comprobación lineal estricta
      if (requiredArea <= availableArea * 0.7 && maxViewW <= availW && maxViewH <= availH) {
        return scale;
      }
    }
    return 1000;
  }

  private packViews(views: DrawingView[], scale: number, format: PaperFormat, titleBlock: TitleBlock): DrawingView[] {
    let currentX = this.MARGIN;
    let currentY = this.MARGIN; // Empezamos arriba a la izquierda
    let rowHeight = 0;

    for (const view of views) {
      view.viewport.scale = 1 / scale;
      const box = view.projectedGeometry.calculateBoundingBox(view.viewport.scale);

      // Verificamos si entra en el ancho
      if (currentX + box.width > format.width - this.MARGIN) {
        currentX = this.MARGIN;
        currentY += rowHeight + 20;
        rowHeight = 0;
      }

      // Verificamos colisión con el Rótulo (TitleBlock Dead Zone)
      const isOverlapX = currentX < titleBlock.x + titleBlock.width && currentX + box.width > titleBlock.x;
      const isOverlapY = currentY < titleBlock.y + titleBlock.height && currentY + box.height > titleBlock.y;
      
      if (isOverlapX && isOverlapY) {
        // Salto de línea forzado si choca con el rótulo
        currentX = this.MARGIN;
        currentY += rowHeight + 20;
        rowHeight = 0;
      }

      view.viewport.x = currentX;
      view.viewport.y = currentY;

      currentX += box.width + 20;
      rowHeight = Math.max(rowHeight, box.height);
    }
    
    return views;
  }

  private generateTitleBlock(format: PaperFormat, data: any): TitleBlock {
    const w = 180;
    const h = 60;
    return {
      x: format.width - this.MARGIN - w, // Esquina inferior derecha
      y: format.height - this.MARGIN - h,
      width: w,
      height: h,
      fields: { project: data.projectName }
    };
  }

  public exportToSvg(sheet: DrawingSheet): string {
    // Svg Render simplificado para el test
    let svg = `<svg width="${sheet.format.width}" height="${sheet.format.height}" xmlns="http://www.w3.org/2000/svg">\n`;
    for (const view of sheet.views) {
      const box = view.projectedGeometry.calculateBoundingBox(view.viewport.scale);
      svg += `  <g id="${view.id}" transform="translate(${view.viewport.x}, ${view.viewport.y})">\n`;
      svg += `    <!-- View scale: 1:${Math.round(1/view.viewport.scale)} -->\n`;
      svg += `    <rect width="${box.width}" height="${box.height}" fill="none" stroke="blue" stroke-dasharray="5,5" />\n`;
      svg += `  </g>\n`;
    }
    svg += `  <g id="title_block" transform="translate(${sheet.titleBlock.x}, ${sheet.titleBlock.y})">\n`;
    svg += `    <rect width="${sheet.titleBlock.width}" height="${sheet.titleBlock.height}" fill="white" stroke="black" />\n`;
    svg += `    <text x="10" y="30">${sheet.titleBlock.fields.project}</text>\n`;
    svg += `  </g>\n`;
    svg += `</svg>`;
    return svg;
  }
}
