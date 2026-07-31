import { ProjectedGeometry } from '../../domain/projection/ProjectedGeometry';
import { DrawingView } from '../../domain/layout/DrawingView';
import { DrawingValidationResult } from '../../domain/generation/DrawingValidationResult';
import { DiagnosticSeverity } from '../../domain/projection/ProjectionDiagnostics';
import { IDrawingGenerator, GenerationContext } from './IDrawingGenerator';
import { PluginRegistry } from './PluginRegistry';
import { v4 as uuidv4 } from 'uuid';

export class DrawingPipeline {
  public execute(generatorName: string, geometry: ProjectedGeometry): DrawingView {
    const generator = PluginRegistry.get(generatorName);
    
    if (!generator) {
      throw new Error(`DrawingGenerator '${generatorName}' not found in registry.`);
    }

    const context: GenerationContext = {
      projectedGeometry: geometry,
      validationResult: new DrawingValidationResult(),
      startTime: Date.now()
    };

    try {
      return generator.generate(context);
    } catch (error: any) {
      context.validationResult.add({
        code: 'GEN_ERR',
        message: `Generator failed: ${error.message}`,
        stage: 'Generation',
        severity: DiagnosticSeverity.Error
      });

      // Fallback empty view on fatal error
      return new DrawingView(
        uuidv4(),
        `Error: ${generatorName}`,
        {
          versionId: uuidv4(),
          checksum: '',
          generatedFromPipeline: '',
          generatedAt: new Date().toISOString(),
          generatorVersion: '0.1.0'
        }
      );
    }
  }
}
