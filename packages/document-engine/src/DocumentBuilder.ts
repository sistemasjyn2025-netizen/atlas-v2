import { v4 as uuidv4 } from 'uuid';
import { EntityManager } from '@atlas/kernel';
import { DocumentEntity, Sheet, View, Dimension, Annotation } from '@atlas/types';

export class DocumentBuilder {
  constructor(private entityManager: EntityManager) {}

  public createDocument(
    title: string,
    documentType: DocumentEntity['documentType'],
    sourceProjectVersion: number,
    revisionNumber: string = '0'
  ): DocumentEntity {
    const doc: DocumentEntity = {
      id: uuidv4(),
      type: 'Document',
      title,
      documentType,
      revisionNumber,
      createdAt: new Date().toISOString(),
      sourceProjectVersion,
      sheetIds: []
    };
    this.entityManager.getGraph().documents[doc.id] = doc;
    return doc;
  }

  public createSheet(
    documentId: string,
    size: Sheet['size'],
    scale: number
  ): Sheet {
    const sheet: Sheet = {
      id: uuidv4(),
      type: 'Sheet',
      scale,
      size,
      viewIds: []
    };
    this.entityManager.getGraph().sheets[sheet.id] = sheet;
    
    const doc = this.entityManager.getGraph().documents[documentId];
    if (doc) {
      doc.sheetIds.push(sheet.id);
    }
    return sheet;
  }

  public createView(
    sheetId: string,
    viewType: View['viewType'],
    origin: View['origin'],
    direction: View['direction'],
    referencedEntityIds: string[]
  ): View {
    const view: View = {
      id: uuidv4(),
      type: 'View',
      viewType,
      origin,
      direction,
      referencedEntityIds,
      dimensionIds: [],
      annotationIds: []
    };
    this.entityManager.getGraph().views[view.id] = view;
    
    const sheet = this.entityManager.getGraph().sheets[sheetId];
    if (sheet) {
      sheet.viewIds.push(view.id);
    }
    return view;
  }

  public createDimension(
    viewId: string,
    startPoint: { x: number, y: number },
    endPoint: { x: number, y: number },
    value: number,
    unit: string = 'mm'
  ): Dimension {
    const dim: Dimension = {
      id: uuidv4(),
      type: 'Dimension',
      startPoint,
      endPoint,
      value,
      unit
    };
    this.entityManager.getGraph().dimensions[dim.id] = dim;
    
    const view = this.entityManager.getGraph().views[viewId];
    if (view) {
      view.dimensionIds.push(dim.id);
    }
    return dim;
  }

  public createAnnotation(
    viewId: string,
    text: string,
    position: { x: number, y: number }
  ): Annotation {
    const ann: Annotation = {
      id: uuidv4(),
      type: 'Annotation',
      text,
      position
    };
    this.entityManager.getGraph().annotations[ann.id] = ann;
    
    const view = this.entityManager.getGraph().views[viewId];
    if (view) {
      view.annotationIds.push(ann.id);
    }
    return ann;
  }
}
