import { PipelineResult } from '@atlas/runtime';
import { IDeliverableExporter } from './IDeliverableExporter';
import { DeliverableFile } from '../domain/DeliverableFile';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PdfReportExporter implements IDeliverableExporter {
  supports(result: PipelineResult): boolean {
    return !!result.manufacturingParts && !!result.quote;
  }

  async export(result: PipelineResult): Promise<DeliverableFile[]> {
    if (!this.supports(result)) return [];

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('es-ES');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text('ATLAS - Reporte Ejecutivo del Proyecto', 14, 20);
    
    // Subtitle / Info
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`ID del Proyecto: ${result.projectId || 'N/A'}`, 14, 30);
    doc.text(`Fecha de Generación: ${dateStr}`, 14, 36);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(40, 44, 52);
    doc.text('Métricas de Ingeniería', 14, 50);

    const members = Object.keys(result.entityGraph?.components || {}).length + Object.keys(result.entityGraph?.assemblies || {}).length;
    const parts = result.manufacturingParts?.length || 0;
    
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Elementos Estructurales: ${members}`, 14, 58);
    doc.text(`Partes de Fabricación: ${parts}`, 14, 64);

    let currentY = 80;

    // Cost Summary
    if (result.quote) {
      doc.setFontSize(14);
      doc.setTextColor(40, 44, 52);
      doc.text('Resumen de Costos Estimados', 14, currentY);
      
      const matCost = result.quote.totalMaterialCost || 0;
      const opCost = result.quote.totalOperationCost || 0;
      const total = result.quote.grandTotal || 0;

      autoTable(doc, {
        startY: currentY + 6,
        head: [['Concepto', 'Monto (USD)']],
        body: [
          ['Materiales', `$${matCost.toFixed(2)}`],
          ['Operaciones de Fabricación', `$${opCost.toFixed(2)}`],
          ['Costo Total Estimado', `$${total.toFixed(2)}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [31, 111, 235] }, // atlas blue
        styles: { fontSize: 10 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // BOM
    if (result.manufacturingParts && result.manufacturingParts.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40, 44, 52);
      doc.text('Lista de Materiales (BOM)', 14, currentY);

      const tableData = result.manufacturingParts.map(p => {
        // mock weight
        let kgPerM = 30;
        const prof = p.profile?.toUpperCase() || '';
        if (prof.includes('HEB 200')) kgPerM = 61.3;
        else if (prof.includes('HEB 300')) kgPerM = 117;
        else if (prof.includes('IPE 200')) kgPerM = 22.4;
        else if (prof.includes('IPE 300')) kgPerM = 42.2;
        else if (prof.includes('IPE 400')) kgPerM = 66.3;
        
        const lengthM = (p.length || 0) / 1000;
        const weight = lengthM * kgPerM;
        const totalWeight = weight * (p.quantity || 1);

        return [
          p.id.substring(0, 8),
          p.profile || 'N/A',
          (p.length || 0).toFixed(2),
          p.quantity || 1,
          totalWeight.toFixed(2)
        ];
      });

      autoTable(doc, {
        startY: currentY + 6,
        head: [['ID', 'Perfil', 'Longitud (mm)', 'Cant.', 'Peso Total (kg)']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [48, 54, 61] }, 
        styles: { fontSize: 9 }
      });
    }

    const pdfBuffer = doc.output('arraybuffer');

    return [{
      id: uuidv4(),
      category: 'Reports',
      name: 'Reporte_Ejecutivo',
      extension: 'pdf',
      mimeType: 'application/pdf',
      size: pdfBuffer.byteLength,
      version: '1.0',
      createdAt: new Date().toISOString(),
      content: new Uint8Array(pdfBuffer)
    }];
  }
}
