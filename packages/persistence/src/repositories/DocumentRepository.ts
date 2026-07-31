import { getAtlasDatabase } from '../AtlasDatabase';
import { DocumentEntity } from '@atlas/types';

export class DocumentRepository {
  private db: any;

  constructor(db?: any) {
    this.db = db ?? getAtlasDatabase();
  }

  async saveDocuments(
    projectId: string,
    revisionId: string,
    documents: DocumentEntity[]
  ) {
    if (documents.length === 0) return [];

    const rows = documents.map(doc => ({
      id: doc.id,
      projectId,
      revisionId,
      documentType: doc.documentType ?? 'Unknown',
      revisionNumber: typeof doc.revisionNumber === 'string'
        ? parseInt(doc.revisionNumber, 10)
        : ((doc.revisionNumber as unknown as number) ?? 1),
      sourceProjectVersion: doc.sourceProjectVersion ?? 1,
      // Store the full DocumentEntity as the JSONB payload for complete roundtrip
      sheets: doc as any,
      referencedEntityIds: (doc as any).referencedEntityIds ?? []
    }));

    await this.db.document.createMany({ data: rows });
    return rows;
  }

  async findDocumentsByRevision(revisionId: string) {
    return this.db.document.findMany({
      where: { revisionId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findDocumentsByProject(projectId: string) {
    return this.db.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
