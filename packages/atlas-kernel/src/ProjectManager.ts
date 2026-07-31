import { AtlasDocument, AtlasFormatMetadata, EntityGraph } from '@atlas/types';
import { EntityManager } from './EntityManager';

export class ProjectManager {
  private currentFormatVersion = '0.1';
  private currentAtlasVersion = '0.1';

  public createNewProject(name: string): { document: AtlasDocument, entityManager: EntityManager } {
    const entityManager = new EntityManager();
    entityManager.createProject(name);

    const document: AtlasDocument = {
      metadata: {
        formatVersion: this.currentFormatVersion,
        atlasVersion: this.currentAtlasVersion
      },
      graph: entityManager.getGraph(),
      parameters: {}
    };

    return { document, entityManager };
  }

  public serialize(document: AtlasDocument): string {
    // Logic for validating and saving to .atlas format (JSON)
    return JSON.stringify(document, null, 2);
  }

  public deserialize(data: string): { document: AtlasDocument, entityManager: EntityManager } {
    const document = JSON.parse(data) as AtlasDocument;
    
    if (!document.metadata || document.metadata.formatVersion !== this.currentFormatVersion) {
      throw new Error(`Unsupported format version: ${document?.metadata?.formatVersion}`);
    }

    const entityManager = new EntityManager(document.graph);
    return { document, entityManager };
  }
}
