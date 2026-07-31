import { ILayoutStage, LayoutContext } from '../ILayoutStage';
import { DrawingSheet } from '../../../domain/layout/DrawingSheet';
import { DiagnosticSeverity } from '../../../domain/projection/ProjectionDiagnostics';

export class SheetValidator implements ILayoutStage {
  public execute(context: LayoutContext, sheet: DrawingSheet): DrawingSheet {
    // Validate overlapping viewports, sheet overflow, missing title blocks, etc.
    if (!sheet.titleBlock) {
      context.diagnostics.push({
        code: 'LAY_001',
        message: 'Sheet is missing a Title Block',
        severity: DiagnosticSeverity.Warning
      });
    }

    if (sheet.getViewports().length === 0) {
      context.diagnostics.push({
        code: 'LAY_002',
        message: 'Sheet has no viewports',
        severity: DiagnosticSeverity.Warning
      });
    }

    return sheet;
  }
}
