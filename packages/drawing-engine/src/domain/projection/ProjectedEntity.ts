import { AnalyticalGeometry } from '../geometry/Geometry';
import { VisibilityMetadata } from './VisibilityMetadata';

export class ProjectedEntity {
  constructor(
    public readonly entityId: string, // References the source entity in DocumentGraph
    public readonly projectedGeometry: AnalyticalGeometry,
    public readonly visibility: VisibilityMetadata,
    public readonly sourceReference: string, // Additional context (e.g., 'Web', 'Flange')
    public readonly styleHints?: Record<string, string> // Hints for Drawing Pipeline
  ) {}
}
