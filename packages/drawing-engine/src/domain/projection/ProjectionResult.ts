import { ProjectedGeometry } from './ProjectedGeometry';
import { ProjectionDefinition } from './ProjectionDefinition';

export class ProjectionResult {
  constructor(
    public readonly definition: ProjectionDefinition,
    public readonly geometry: ProjectedGeometry
  ) {}
}
