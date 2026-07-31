import { PipelineResult } from '@atlas/runtime';
import { IProjectionStage, ProjectionContext } from '../../domain/projection/IProjectionStage';
import { ProjectionDefinition } from '../../domain/projection/ProjectionDefinition';
import { ProjectionResult } from '../../domain/projection/ProjectionResult';
import { ProjectedGeometry } from '../../domain/projection/ProjectedGeometry';
import { ProjectionSolver } from './stages/ProjectionSolver';
import { ClippingResolver } from './stages/ClippingResolver';
import { VisibilityResolver } from './stages/VisibilityResolver';
import { HiddenLineResolver } from './stages/HiddenLineResolver';
import { SimplificationResolver } from './stages/SimplificationResolver';
import { DiagnosticsStage } from './stages/DiagnosticsStage';

export class ProjectionPipeline {
  private stages: IProjectionStage[] = [];

  constructor() {
    // Default pipeline arrangement
    this.stages.push(new ProjectionSolver());
    this.stages.push(new ClippingResolver());
    this.stages.push(new VisibilityResolver());
    this.stages.push(new HiddenLineResolver());
    this.stages.push(new SimplificationResolver());
    this.stages.push(new DiagnosticsStage());
  }

  public addStage(stage: IProjectionStage): void {
    this.stages.push(stage);
  }

  public execute(sourceResult: PipelineResult, definition: ProjectionDefinition): ProjectionResult {
    const context: ProjectionContext = {
      sourceResult,
      definition,
      diagnostics: [],
      startTime: Date.now()
    };

    let currentGeometry: ProjectedGeometry | null = null;

    for (const stage of this.stages) {
      currentGeometry = stage.execute(context, currentGeometry);
    }

    if (!currentGeometry) {
      throw new Error("Projection pipeline failed to produce geometry");
    }

    return new ProjectionResult(definition, currentGeometry);
  }
}
