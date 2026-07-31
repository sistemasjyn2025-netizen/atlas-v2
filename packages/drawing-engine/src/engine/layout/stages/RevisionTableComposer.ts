import { ILayoutStage, LayoutContext } from '../ILayoutStage';
import { DrawingSheet } from '../../../domain/layout/DrawingSheet';
import { RevisionEntry } from '../../../domain/layout/TitleBlock';

export class RevisionTableComposer implements ILayoutStage {
  public execute(context: LayoutContext, sheet: DrawingSheet): DrawingSheet {
    // Generate revision table
    // Fetch revisions from session or package and apply them to the sheet
    const initialRevision = new RevisionEntry(
      '00',
      new Date().toISOString().split('T')[0],
      'Initial Issue',
      'System',
      'TBD'
    );
    sheet.addRevision(initialRevision);
    
    return sheet;
  }
}
