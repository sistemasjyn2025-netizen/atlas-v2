import { GenerationContext } from '../IDrawingGenerator';
import { DrawingView } from '../../../domain/layout/DrawingView';

export class EntityGenerator {
  public static execute(context: GenerationContext, view: DrawingView): void {
    // Phase 2: Convert ProjectedEntities to base DrawingEntities (Lines, Arcs, etc.)
    // Note: Dimensions and Annotations are handled in subsequent stages
  }
}
