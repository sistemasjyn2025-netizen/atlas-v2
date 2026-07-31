// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { PipelineResult } from '@atlas/runtime';
import { IDeliverableExporter } from './IDeliverableExporter';
import { DeliverableFile } from '../domain/DeliverableFile';
import { v4 as uuidv4 } from 'uuid';

try {
  // Manejo seguro para Vite / ESM
  if (pdfFonts && pdfFonts.pdfMake) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && (pdfFonts as any).default?.pdfMake) {
    pdfMake.vfs = (pdfFonts as any).default.pdfMake.vfs;
  }
} catch (e) {
  console.warn("Could not load pdfMake vfs fonts", e);
}
export class PdfDocumentExporter implements IDeliverableExporter {
  supports(result: PipelineResult): boolean {
    return !!result.quote;
  }

  async export(result: PipelineResult): Promise<DeliverableFile[]> {
    if (!this.supports(result) || !result.quote) return [];

    return new Promise((resolve) => {
      const docDefinition = {
        content: [
          { text: 'Memoria Técnica - Presupuesto', style: 'header' },
          { text: `Proyecto ID: ${result.projectId || 'N/A'}\n\n`, style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                ['Concepto', 'Cantidad', 'Precio (USD)'],
                ['Materiales Estructurales', '1', `$${(result.quote.totalMaterialCost || 0).toFixed(2)}`],
                ['Operaciones y Manufactura', '1', `$${(result.quote.totalOperationCost || 0).toFixed(2)}`],
                ['Horas de Ingeniería', '1', `$${(result.quote.totalLaborCost || 0).toFixed(2)}`],
                [{ text: 'Total Estimado', bold: true, colSpan: 2 }, {}, `$${(result.quote.grandTotal || 0).toFixed(2)}`]
              ]
            }
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
          subheader: { fontSize: 12, margin: [0, 0, 0, 5] as [number, number, number, number] }
        }
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob(async (blob: Blob) => {
        resolve([{
          id: uuidv4(),
          category: 'Reports',
          name: 'Memoria_Tecnica_Presupuesto',
          extension: 'pdf',
          mimeType: 'application/pdf',
          size: blob.size,
          version: '1.0',
          createdAt: new Date().toISOString(),
          content: new Uint8Array(await blob.arrayBuffer()), // ArrayBuffer real
          blob: blob
        }]);
      });
    });
  }
}
