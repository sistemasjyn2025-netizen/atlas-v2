import { ILayoutStage, LayoutContext } from '../ILayoutStage';
import { DrawingSheet } from '../../../domain/layout/DrawingSheet';

export class ScaleResolver implements ILayoutStage {
  public execute(context: LayoutContext, sheet: DrawingSheet): DrawingSheet {
    // Automatically choose the best scale for the viewports based on paper size
    return sheet;
  }
}
