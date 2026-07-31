import { SheetComposer, DrawingView, PaperFormat } from './SheetComposer';

// 1. Setup Mock Data
// Galpón simulado: 50x20m (50000x20000 mm)
const mockProjectData = { projectName: 'Galpón 50x20 - ATLASv2' };
const A1Format: PaperFormat = { width: 841, height: 594 }; // A1 en horizontal (mm)

// Función para simular una vista que calcula su BoundingBox
const createMockView = (id: string, realWidthMm: number, realHeightMm: number): DrawingView => ({
  id,
  viewport: { x: 0, y: 0, scale: 1 },
  projectedGeometry: {
    calculateBoundingBox: (scale: number) => ({
      width: realWidthMm * scale,
      height: realHeightMm * scale
    })
  }
});

// Vistas del Galpón: Frontal (50x10m altura), Lateral (20x10m altura), Planta (50x20m)
const rawViews: DrawingView[] = [
  createMockView('view_planta', 50000, 20000),
  createMockView('view_frontal', 50000, 10000),
  createMockView('view_lateral', 20000, 10000)
];

console.log("=== Ejecutando Test: SheetComposer ===");

const composer = new SheetComposer();

// 2. Probar Cálculo de Escala
const optimalScale = composer.calculateOptimalScale(rawViews, A1Format);
console.log(`\n> Escala Óptima Calculada para A1: 1:${optimalScale}`);

// 3. Generar la hoja (incluye empaquetado y chequeo de colisión con TitleBlock)
const sheet = composer.compose(A1Format, rawViews, mockProjectData);

console.log(`\n> Vistas empaquetadas en la hoja (Verificando no-colisión con rótulo):`);
console.log(`Rótulo: x=${sheet.titleBlock.x}, y=${sheet.titleBlock.y}, w=${sheet.titleBlock.width}, h=${sheet.titleBlock.height}`);
sheet.views.forEach(v => {
  const box = v.projectedGeometry.calculateBoundingBox(v.viewport.scale);
  console.log(`- ${v.id}: x=${v.viewport.x.toFixed(2)}, y=${v.viewport.y.toFixed(2)} (w:${box.width.toFixed(2)}, h:${box.height.toFixed(2)})`);
});

// 4. Exportar a SVG
const svgOutput = composer.exportToSvg(sheet);
console.log(`\n> SVG Output generado:\n`);
console.log(svgOutput);
