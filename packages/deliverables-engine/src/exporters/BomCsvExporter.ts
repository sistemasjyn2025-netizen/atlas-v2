import { PipelineResult } from '@atlas/runtime';
import { IDeliverableExporter } from './IDeliverableExporter';
import { DeliverableFile } from '../domain/DeliverableFile';
import { v4 as uuidv4 } from 'uuid';

export class BomCsvExporter implements IDeliverableExporter {
  supports(result: PipelineResult): boolean {
    return !!result.bom;
  }

  async export(result: PipelineResult): Promise<DeliverableFile[]> {
    if (!result.bom) return [];

    let csv = 'ID;Perfil;Longitud (mm);Cantidad;Peso Total (kg)\n';
    
    // Fallback in case manufacturingParts is available instead of mapped bom
    const parts = result.manufacturingParts || [];
    
    for (const part of parts) {
      let kgPerM = 30;
      const prof = part.profile?.toUpperCase() || '';
      if (prof.includes('HEB 200')) kgPerM = 61.3;
      else if (prof.includes('HEB 300')) kgPerM = 117;
      else if (prof.includes('IPE 200')) kgPerM = 22.4;
      else if (prof.includes('IPE 300')) kgPerM = 42.2;
      else if (prof.includes('IPE 400')) kgPerM = 66.3;
      
      const lengthM = (part.length || 0) / 1000;
      const weight = lengthM * kgPerM;
      const totalWeight = weight * (part.quantity || 1);

      csv += `${part.id};${part.profile || ''};${(part.length || 0).toFixed(2)};${part.quantity || 1};${totalWeight.toFixed(2)}\n`;
    }

    return [{
      id: uuidv4(),
      category: 'BOM',
      name: 'Bill_of_Materials',
      extension: 'csv',
      mimeType: 'text/csv',
      size: csv.length,
      version: '1.0',
      createdAt: new Date().toISOString(),
      content: csv
    }];
  }
}
