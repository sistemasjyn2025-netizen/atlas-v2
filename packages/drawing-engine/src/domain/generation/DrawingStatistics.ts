import { BoundingBox2D } from '../projection/ProjectionDefinition';

export interface DrawingStatistics {
  entityCount: number;
  dimensionCount: number;
  annotationCount: number;
  centerlineCount: number;
  labelCount: number;
  warningCount: number;
  errorCount: number;
  boundingBox: BoundingBox2D;
  generationTimeMs: number;
}
