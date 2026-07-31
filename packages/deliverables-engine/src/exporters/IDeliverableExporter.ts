import { PipelineResult } from '@atlas/runtime';
import { DeliverableFile } from '../domain/DeliverableFile';

export interface IDeliverableExporter {
  supports(result: PipelineResult): boolean;
  export(result: PipelineResult): Promise<DeliverableFile[]>;
}
