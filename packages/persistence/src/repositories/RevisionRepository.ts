import { getAtlasDatabase } from '../AtlasDatabase';
import { EntityGraph } from '@atlas/types';
import { ManufacturingPart } from '@atlas/manufacturing-engine';

export interface SaveRevisionInput {
  projectId: string;
  revisionNumber: number;
  description?: string;
  sourceProjectState: object;
  entityGraph: EntityGraph;
  parts: ManufacturingPart[];
}

export class RevisionRepository {
  private db: any;

  constructor(db?: any) {
    this.db = db ?? getAtlasDatabase();
  }

  async saveRevision(input: SaveRevisionInput) {
    const { projectId, revisionNumber, description, sourceProjectState, entityGraph, parts } = input;

    return this.db.$transaction(async (tx: any) => {
      // 1. Create the revision record
      const revision = await tx.projectRevision.create({
        data: {
          projectId,
          revisionNumber,
          description: description ?? `Revision ${revisionNumber}`,
          sourceProjectState
        }
      });

      // 2. Persist all structural entities from the EntityGraph
      const entityRows = this._flattenGraph(entityGraph, projectId, revision.id);
      if (entityRows.length > 0) {
        await tx.structuralEntity.createMany({ data: entityRows });
      }

      // 3. Persist manufacturing parts
      const partRows = parts.map(part => ({
        id: part.id,
        projectId,
        revisionId: revision.id,
        name: part.name,
        profile: part.profile,
        materialRef: part.materialRef,
        length: part.length,
        quantity: part.quantity,
        operations: part.operations as any,
        sourceEntityIds: part.sourceEntityIds,
        sourceAssemblyIds: part.sourceAssemblyIds,
        properties: {}
      }));
      if (partRows.length > 0) {
        await tx.manufacturingPart.createMany({ data: partRows });
      }

      return revision;
    });
  }

  async loadRevision(revisionId: string) {
    return this.db.projectRevision.findUnique({
      where: { id: revisionId },
      include: {
        structuralEntities: true,
        manufacturingParts: true,
        documents: true,
        quotes: true
      }
    });
  }

  async getLatestRevision(projectId: string) {
    return this.db.projectRevision.findFirst({
      where: { projectId },
      orderBy: { revisionNumber: 'desc' },
      include: {
        structuralEntities: true,
        manufacturingParts: true,
        documents: true,
        quotes: true
      }
    });
  }

  async getNextRevisionNumber(projectId: string): Promise<number> {
    const latest = await this.db.projectRevision.findFirst({
      where: { projectId },
      orderBy: { revisionNumber: 'desc' },
      select: { revisionNumber: true }
    });
    return (latest?.revisionNumber ?? 0) + 1;
  }

  /**
   * Flattens the in-memory EntityGraph into rows suitable for createMany.
   * All entity subtypes (StructuralSystem, Assembly, Component, Extrusion, etc.)
   * are stored as generic rows with a `type` discriminator and a JSONB `properties` blob.
   */
  private _flattenGraph(
    graph: EntityGraph,
    projectId: string,
    revisionId: string
  ): Array<any> {
    const rows: Array<any> = [];

    const push = (id: string, parentId: string | null, type: string, properties: object) => {
      rows.push({ id, projectId, revisionId, parentId, type, properties });
    };

    for (const [id, proj] of Object.entries(graph.projects ?? {})) {
      push(id, null, 'Project', proj);
    }
    for (const [id, sys] of Object.entries(graph.structuralSystems ?? {})) {
      push(id, (sys as any).projectId ?? null, 'StructuralSystem', sys);
    }
    for (const [id, asm] of Object.entries(graph.assemblies ?? {})) {
      push(id, (asm as any).structuralSystemId ?? null, 'Assembly', asm);
    }
    for (const [id, sub] of Object.entries(graph.subAssemblies ?? {})) {
      push(id, null, 'SubAssembly', sub);
    }
    for (const [id, comp] of Object.entries(graph.components ?? {})) {
      push(id, (comp as any).assemblyId ?? null, 'Component', comp);
    }
    for (const [id, elem] of Object.entries(graph.elements ?? {})) {
      push(id, (elem as any).componentId ?? null, 'Element', elem);
    }
    for (const [id, doc] of Object.entries(graph.documents ?? {})) {
      push(id, null, 'Document', doc);
    }
    for (const [id, sheet] of Object.entries(graph.sheets ?? {})) {
      push(id, null, 'Sheet', sheet);
    }
    for (const [id, view] of Object.entries(graph.views ?? {})) {
      push(id, null, 'View', view);
    }

    return rows;
  }
}
