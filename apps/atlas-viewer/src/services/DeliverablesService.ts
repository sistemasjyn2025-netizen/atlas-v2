import type { PipelineResult } from '@atlas/runtime';
import { DeliverablesEngine, DocumentPackage, DeliverablesEventEmitter } from '@atlas/deliverables-engine';
import type { PublishConfiguration, DeliverableEvent } from '@atlas/deliverables-engine';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class DeliverablesService {
  private engine: DeliverablesEngine;
  private onEvent?: (event: DeliverableEvent) => void;

  constructor(onEvent?: (event: DeliverableEvent) => void) {
    this.engine = new DeliverablesEngine();
    this.onEvent = onEvent;
    
    if (this.onEvent) {
      this.engine.on((event) => {
        this.onEvent!(event);
      });
    }
  }

  public async publishAndDownload(result: PipelineResult, config: PublishConfiguration): Promise<void> {
    const docPackage = await this.engine.publish(result, config);
    await this.downloadPackage(docPackage);
  }

  private async downloadPackage(docPackage: DocumentPackage): Promise<void> {
    const zip = new JSZip();
    const files = docPackage.getFiles();

    for (const file of files) {
      const fileName = `${file.category}/${file.name}.${file.extension}`;
      zip.file(fileName, file.content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const safeProjectId = docPackage.getProjectId().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'project';
    saveAs(blob, `ATLAS_Deliverables_${safeProjectId}.zip`);
  }
}
