import { PipelineResult } from '@atlas/runtime';
import { DocumentPackage } from '../domain/DocumentPackage';
import { PublishConfiguration } from '../domain/PublishConfiguration';
import { PublishPlanner } from './PublishPlanner';
import { DeliverablesEventEmitter } from '../events/DeliverablesEvents';
import { DeliverableFile } from '../domain/DeliverableFile';

export class DeliverablesEngine extends DeliverablesEventEmitter {
  private planner: PublishPlanner;

  constructor() {
    super();
    this.planner = new PublishPlanner();
  }

  public async publish(result: PipelineResult, config: PublishConfiguration): Promise<DocumentPackage> {
    const exporters = this.planner.planExporters(config);
    const projectId = result.projectId || 'Unknown';
    
    this.emit({ type: 'PublishStarted', projectId, totalExporters: exporters.length });

    const allFiles: DeliverableFile[] = [];

    for (const exporter of exporters) {
      if (exporter.supports(result)) {
        const exporterName = exporter.constructor.name;
        this.emit({ type: 'ExporterStarted', exporterName });

        try {
          const files = await exporter.export(result);
          allFiles.push(...files);
          this.emit({ type: 'ExporterCompleted', exporterName, files });
        } catch (error: any) {
          this.emit({ type: 'ExporterFailed', exporterName, error: error.message });
        }
      }
    }

    const docPackage = new DocumentPackage(allFiles, projectId, '1.0');
    
    this.emit({ type: 'PublishCompleted', projectId, totalFiles: allFiles.length });

    return docPackage;
  }
}
