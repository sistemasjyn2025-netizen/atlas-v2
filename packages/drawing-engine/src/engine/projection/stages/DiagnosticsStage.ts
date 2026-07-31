import { IProjectionStage, ProjectionContext } from '../../../domain/projection/IProjectionStage';
import { ProjectedGeometry } from '../../../domain/projection/ProjectedGeometry';
import { DiagnosticSeverity } from '../../../domain/projection/ProjectionDiagnostics';

export class DiagnosticsStage implements IProjectionStage {
  execute(context: ProjectionContext, currentGeometry: ProjectedGeometry | null): ProjectedGeometry {
    if (!currentGeometry) throw new Error("DiagnosticsStage requires previous geometry");
    
    // Future: Analyze the result and append warnings or errors to context.diagnostics
    // e.g. check for zero-length lines or overlapping identical geometries
    
    context.diagnostics.push({
      code: 'PROJ_001',
      message: 'Projection pipeline completed successfully.',
      stage: 'DiagnosticsStage',
      severity: DiagnosticSeverity.Info
    });

    const execTime = Date.now() - context.startTime;

    return new ProjectedGeometry(
      currentGeometry.entities,
      currentGeometry.boundingBox,
      context.diagnostics,
      {
        originalEntityCount: context.sourceResult.entityGraph?.getNodes().size || 0,
        projectedEntityCount: currentGeometry.entities.length,
        clippedEntityCount: 0,
        hiddenLineCount: 0,
        executionTimeMs: execTime
      }
    );
  }
}
