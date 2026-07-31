import { PipelineResult } from '@atlas/runtime';
import { ProjectionDefinition } from './ProjectionDefinition';
import { ProjectedGeometry } from './ProjectedGeometry';
import { ProjectionDiagnostic } from './ProjectionDiagnostics';

export interface ProjectionContext {
  definition: ProjectionDefinition;
  sourceResult: PipelineResult;
  diagnostics: ProjectionDiagnostic[];
  startTime: number;
}

export interface IProjectionStage {
  execute(context: ProjectionContext, currentGeometry: ProjectedGeometry | null): ProjectedGeometry;
}
