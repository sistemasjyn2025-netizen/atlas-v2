import { EntityGraph } from '@atlas/types';
import { ManufacturingPart } from '@atlas/manufacturing-engine';
import { Quote } from '@atlas/cost-engine';
import { DocumentEntity } from '@atlas/types';

import { getAtlasDatabase } from './AtlasDatabase';
import { ProjectRepository } from './repositories/ProjectRepository';
import { RevisionRepository } from './repositories/RevisionRepository';
import { DocumentRepository } from './repositories/DocumentRepository';
import { QuoteRepository } from './repositories/QuoteRepository';

export interface SaveProjectInput {
  projectName: string;
  description?: string;
  sourceProjectState: object;
  entityGraph: EntityGraph;
  parts: ManufacturingPart[];
  documents: DocumentEntity[];
  quote?: Quote;
}

export interface SaveProjectResult {
  projectId: string;
  revisionId: string;
  revisionNumber: number;
}

export interface LoadProjectResult {
  projectId: string;
  revisionId: string;
  revisionNumber: number;
  sourceProjectState: object;
  structuralEntities: any[];
  manufacturingParts: any[];
  documents: any[];
  quotes: any[];
}

/**
 * PersistenceService is the high-level facade for all ATLAS persistence operations.
 * The Runtime calls this; it never touches individual repositories directly.
 */
export class PersistenceService {
  private projectRepo: ProjectRepository;
  private revisionRepo: RevisionRepository;
  private documentRepo: DocumentRepository;
  private quoteRepo: QuoteRepository;

  constructor(db?: any) {
    const client = db ?? getAtlasDatabase();
    this.projectRepo = new ProjectRepository(client);
    this.revisionRepo = new RevisionRepository(client);
    this.documentRepo = new DocumentRepository(client);
    this.quoteRepo = new QuoteRepository(client);
  }

  /**
   * Saves a full project execution result (EntityGraph, Parts, Documents, Quote)
   * as a new revision. Creates the project if it does not exist.
   */
  async saveProject(input: SaveProjectInput): Promise<SaveProjectResult> {
    // 1. Create project record
    const project = await this.projectRepo.createProject({
      name: input.projectName,
      description: input.description
    });

    await this.projectRepo.logAudit(project.id, 'PROJECT_CREATED', {
      name: project.name
    });

    // 2. Create revision + entities + parts
    const revisionNumber = await this.revisionRepo.getNextRevisionNumber(project.id);
    const revision = await this.revisionRepo.saveRevision({
      projectId: project.id,
      revisionNumber,
      description: input.description ?? `Initial revision`,
      sourceProjectState: input.sourceProjectState,
      entityGraph: input.entityGraph,
      parts: input.parts
    });

    // 3. Save documents
    await this.documentRepo.saveDocuments(project.id, revision.id, input.documents);

    // 4. Save quote if present
    if (input.quote) {
      await this.quoteRepo.saveQuote(project.id, revision.id, input.quote);
    }

    await this.projectRepo.logAudit(project.id, 'REVISION_CREATED', {
      revisionNumber, revisionId: revision.id
    });

    return { projectId: project.id, revisionId: revision.id, revisionNumber };
  }

  /**
   * Adds a new revision to an existing project.
   */
  async createRevision(
    projectId: string,
    input: Omit<SaveProjectInput, 'projectName' | 'description'>
  ): Promise<SaveProjectResult> {
    const revisionNumber = await this.revisionRepo.getNextRevisionNumber(projectId);
    const revision = await this.revisionRepo.saveRevision({
      projectId,
      revisionNumber,
      sourceProjectState: input.sourceProjectState,
      entityGraph: input.entityGraph,
      parts: input.parts
    });

    await this.documentRepo.saveDocuments(projectId, revision.id, input.documents);

    if (input.quote) {
      await this.quoteRepo.saveQuote(projectId, revision.id, input.quote);
    }

    await this.projectRepo.logAudit(projectId, 'REVISION_CREATED', {
      revisionNumber, revisionId: revision.id
    });

    return { projectId, revisionId: revision.id, revisionNumber };
  }

  /**
   * Loads the latest revision of a project with full traceability data.
   */
  async loadProject(projectId: string): Promise<LoadProjectResult | null> {
    const revision = await this.revisionRepo.getLatestRevision(projectId);
    if (!revision) return null;

    return {
      projectId,
      revisionId: revision.id,
      revisionNumber: revision.revisionNumber,
      sourceProjectState: revision.sourceProjectState as object,
      structuralEntities: revision.structuralEntities,
      manufacturingParts: revision.manufacturingParts,
      documents: revision.documents,
      quotes: revision.quotes
    };
  }

  /**
   * Lists all projects.
   */
  async listProjects() {
    return this.projectRepo.listProjects();
  }
}
