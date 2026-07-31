import { ProjectedGeometry } from '../../domain/projection/ProjectedGeometry';
import { DrawingEntityCollection } from '../../domain/generation/DrawingEntityCollection';
import { DrawingValidationResult } from '../../domain/generation/DrawingValidationResult';
import { DrawingView } from '../../domain/layout/DrawingView';

export interface GenerationContext {
  projectedGeometry: ProjectedGeometry;
  validationResult: DrawingValidationResult;
  startTime: number;
}

export interface IDrawingGenerator {
  generate(context: GenerationContext): DrawingView;
}
