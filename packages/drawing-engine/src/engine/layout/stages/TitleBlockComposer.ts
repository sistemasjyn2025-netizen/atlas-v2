import { ILayoutStage, LayoutContext } from '../ILayoutStage';
import { DrawingSheet } from '../../../domain/layout/DrawingSheet';
import { TitleBlock } from '../../../domain/layout/TitleBlock';

export class TitleBlockComposer implements ILayoutStage {
  public execute(context: LayoutContext, sheet: DrawingSheet): DrawingSheet {
    // Generate metadata from DocumentSession
    const titleBlock = new TitleBlock(
      context.session.sessionMetadata.projectName || 'Unknown Project',
      context.session.sessionMetadata.client || 'Unknown Client',
      '00', // Default revision
      'TBD', // Checked By
      'TBD', // Approved By
      new Date().toISOString().split('T')[0], // Issue Date
      'As Indicated', // Scale
      sheet.id, // Sheet Number
      'Default', // Rule Pack
      'mm' // Units
    );

    sheet.setTitleBlock(titleBlock);
    return sheet;
  }
}
