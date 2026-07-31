import { ProjectedEntity } from './ProjectedEntity';
import { BoundingBox2D } from './ProjectionDefinition';
import { ProjectionDiagnostic, ProjectionStatistics } from './ProjectionDiagnostics';

export class ProjectedGeometry {
  constructor(
    public readonly entities: ReadonlyArray<ProjectedEntity>,
    public readonly boundingBox: BoundingBox2D,
    public readonly diagnostics: ReadonlyArray<ProjectionDiagnostic>,
    public readonly statistics: ProjectionStatistics
  ) {}
}
