import { EntityManager } from '@atlas/kernel';
import { DocumentEntity } from '@atlas/types';
import { DocumentBuilder } from '../DocumentBuilder';

export class AssemblyDrawingGenerator {
  constructor(private entityManager: EntityManager) {}

  public generate(assemblyId: string, sourceProjectVersion: number, assemblyName: string = 'Assembly'): DocumentEntity {
    const graph = this.entityManager.getGraph();
    const assembly = graph.assemblies[assemblyId];
    if (!assembly) {
      throw new Error(`Assembly ${assemblyId} not found`);
    }

    const builder = new DocumentBuilder(this.entityManager);
    
    const doc = builder.createDocument(
      `Assembly Drawing - ${assemblyName}`,
      'AssemblyDrawing',
      sourceProjectVersion
    );

    const sheet = builder.createSheet(doc.id, 'A3', 0.1);

    // Front View
    const frontView = builder.createView(
      sheet.id,
      'front',
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      assembly.componentIds
    );

    // Top View
    const topView = builder.createView(
      sheet.id,
      'top',
      { x: 0, y: 1000, z: 0 }, // placed above in the sheet
      { x: 0, y: 0, z: -1 },
      assembly.componentIds
    );

    builder.createAnnotation(frontView.id, `Assembly ID: ${assemblyId}`, { x: 10, y: 10 });
    builder.createAnnotation(topView.id, `TOP VIEW`, { x: 10, y: 10 });

    return doc;
  }
}
