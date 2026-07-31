import { EntityManager } from '@atlas/kernel';
import { ManufacturingPart } from '@atlas/manufacturing-engine';
import { DocumentEntity } from '@atlas/types';
import { DocumentBuilder } from '../DocumentBuilder';

export class ManufacturingPartSheetGenerator {
  constructor(private entityManager: EntityManager) {}

  public generate(part: ManufacturingPart, sourceProjectVersion: number): DocumentEntity {
    const builder = new DocumentBuilder(this.entityManager);
    
    const doc = builder.createDocument(
      `Part Sheet - ${part.name}`,
      'ManufacturingPartSheet',
      sourceProjectVersion
    );

    const sheet = builder.createSheet(doc.id, 'A4', 1);

    const view = builder.createView(
      sheet.id,
      'front',
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, // looking from front
      [...part.sourceEntityIds, ...part.sourceAssemblyIds] // Traceability
    );

    // Annotations for part details
    builder.createAnnotation(view.id, `Profile: ${part.profile}`, { x: 10, y: 10 });
    builder.createAnnotation(view.id, `Material: ${part.materialRef}`, { x: 10, y: 20 });
    builder.createAnnotation(view.id, `Quantity: ${part.quantity}`, { x: 10, y: 30 });
    builder.createAnnotation(view.id, `Operations: ${part.operations.length}`, { x: 10, y: 40 });

    // Dimension for length
    builder.createDimension(
      view.id,
      { x: 50, y: 50 },
      { x: 50 + part.length, y: 50 },
      part.length
    );

    return doc;
  }
}
