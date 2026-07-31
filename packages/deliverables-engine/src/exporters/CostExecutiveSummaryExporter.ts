import { PipelineResult } from '@atlas/runtime';
import { IDeliverableExporter } from './IDeliverableExporter';
import { DeliverableFile } from '../domain/DeliverableFile';
import { v4 as uuidv4 } from 'uuid';

export class CostExecutiveSummaryExporter implements IDeliverableExporter {
  supports(result: PipelineResult): boolean {
    return !!result.quote;
  }

  async export(result: PipelineResult): Promise<DeliverableFile[]> {
    if (!result.quote) return [];

    let content = '# ATLAS - Executive Cost Summary\n\n';
    content += `**Project:** ${result.projectId || 'Unknown'}\n`;
    content += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
    
    content += '## 1. Material Costs\n';
    const matCosts = result.quote.materialCosts || [];
    let matTotal = 0;
    for (const mat of matCosts) {
      const cost = (mat.totalLength || 0) * (mat.pricePerUnit || 0);
      matTotal += cost;
      content += `- ${mat.profile}: $${cost.toFixed(2)}\n`;
    }
    content += `**Subtotal Materials:** $${matTotal.toFixed(2)}\n\n`;

    content += '## 2. Operation Costs\n';
    const opCosts = result.quote.operationCosts || [];
    let opTotal = 0;
    for (const op of opCosts) {
      opTotal += op.cost || 0;
      content += `- Part ${op.manufacturingPartId}: $${(op.cost || 0).toFixed(2)}\n`;
    }
    content += `**Subtotal Operations:** $${opTotal.toFixed(2)}\n\n`;

    content += `## Total Estimated Cost: $${(matTotal + opTotal).toFixed(2)}\n`;

    return [{
      id: uuidv4(),
      category: 'Cost',
      name: 'Executive_Cost_Summary',
      extension: 'md',
      mimeType: 'text/markdown',
      size: content.length,
      version: '1.0',
      createdAt: new Date().toISOString(),
      content
    }];
  }
}
