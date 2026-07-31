import { PipelineResult } from '@atlas/runtime';
import { IDeliverableExporter } from './IDeliverableExporter';
import { DeliverableFile } from '../domain/DeliverableFile';

export abstract class CadExporter implements IDeliverableExporter {
  abstract supports(result: PipelineResult): boolean;
  abstract export(result: PipelineResult): Promise<DeliverableFile[]>;
  
  // Future shared methods for CAD processing (e.g. projecting 3D to 2D)
  protected extract2DGeometries(result: PipelineResult) {
    // Shared CAD logic
  }
}
