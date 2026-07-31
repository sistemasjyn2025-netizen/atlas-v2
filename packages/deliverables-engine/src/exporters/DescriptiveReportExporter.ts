import { PipelineResult } from '@atlas/runtime';
import { IDeliverableExporter } from './IDeliverableExporter';
import { DeliverableFile } from '../domain/DeliverableFile';
import { v4 as uuidv4 } from 'uuid';

export class DescriptiveReportExporter implements IDeliverableExporter {
  supports(result: PipelineResult): boolean {
    return true; // Always supported
  }

  async export(result: PipelineResult): Promise<DeliverableFile[]> {
    let content = '# ATLAS - Descriptive Technical Report\n\n';
    content += `**Project:** ${result.projectId || 'Unknown'}\n`;
    content += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

    content += '## 1. Summary\n';
    content += `This document contains the structural description for the generated project.\n\n`;

    content += '## 2. Metrics\n';
    if (result.summary) {
      content += `- **Total Assemblies:** ${result.summary.totalAssemblies}\n`;
      content += `- **Total Components:** ${result.summary.totalComponents}\n`;
      content += `- **Total Manufacturing Parts:** ${result.summary.totalManufacturingParts}\n`;
      content += `- **Total Documents (Internal):** ${result.summary.totalDocuments}\n\n`;
    }

    return [{
      id: uuidv4(),
      category: 'Report',
      name: 'Descriptive_Memory',
      extension: 'md',
      mimeType: 'text/markdown',
      size: content.length,
      version: '1.0',
      createdAt: new Date().toISOString(),
      content
    }];
  }
}
