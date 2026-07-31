import { ILayoutStage, LayoutContext } from '../ILayoutStage';
import { DrawingSheet } from '../../../domain/layout/DrawingSheet';

export class ViewportSolver implements ILayoutStage {
  public execute(context: LayoutContext, sheet: DrawingSheet): DrawingSheet {
    // Automatically determine viewport size, location, clipping, rotation
    return sheet;
  }
}
