import { DrawingSheet } from '../../domain/layout/DrawingSheet';
import { DrawingView } from '../../domain/layout/DrawingView';
import { DocumentSession } from '../../domain/DocumentSession';

export interface LayoutContext {
  session: DocumentSession;
  views: DrawingView[];
  diagnostics: any[]; // We can reuse ProjectionDiagnostics or create LayoutDiagnostics
}

export interface ILayoutStage {
  execute(context: LayoutContext, sheet: DrawingSheet): DrawingSheet;
}
