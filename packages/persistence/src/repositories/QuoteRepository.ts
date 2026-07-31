import { getAtlasDatabase } from '../AtlasDatabase';
import { Quote } from '@atlas/cost-engine';

export class QuoteRepository {
  private db: any;

  constructor(db?: any) {
    this.db = db ?? getAtlasDatabase();
  }

  async saveQuote(projectId: string, revisionId: string, quote: Quote) {
    return this.db.quote.create({
      data: {
        id: quote.id,
        projectId,
        revisionId,
        materialCosts: quote.materialCosts as any,
        operationCosts: quote.operationCosts as any,
        laborCosts: quote.laborCosts as any,
        totalMaterialCost: quote.summary.totalMaterialCost,
        totalOperationCost: quote.summary.totalOperationCost,
        totalLaborCost: quote.summary.totalLaborCost,
        totalCost: quote.summary.totalCost
      }
    });
  }

  async findQuotesByRevision(revisionId: string) {
    return this.db.quote.findMany({
      where: { revisionId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findLatestQuote(projectId: string) {
    return this.db.quote.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
