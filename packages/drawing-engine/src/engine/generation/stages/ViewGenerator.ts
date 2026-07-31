import { IDrawingGenerator, GenerationContext } from '../IDrawingGenerator';
import { DrawingView } from '../../../domain/layout/DrawingView';
import { v4 as uuidv4 } from 'uuid';

export abstract class ViewGenerator implements IDrawingGenerator {
  protected abstract get viewName(): string;

  public generate(context: GenerationContext): DrawingView {
    const view = new DrawingView(
      uuidv4(),
      this.viewName,
      {
        versionId: uuidv4(),
        checksum: 'TBD',
        generatedFromPipeline: 'TBD',
        generatedAt: new Date().toISOString(),
        generatorVersion: '0.1.0'
      }
    );

    this.executeStages(context, view);

    return view;
  }

  protected abstract executeStages(context: GenerationContext, view: DrawingView): void;
}
