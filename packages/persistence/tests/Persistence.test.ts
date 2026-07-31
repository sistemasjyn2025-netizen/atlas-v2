/**
 * ATLAS Persistence Layer — Golden Dataset Integration Test
 *
 * Strategy: We mock the PrismaClient to avoid a live database dependency
 * in unit/CI tests. The test verifies that:
 *   1. PersistenceService correctly maps the in-memory EntityGraph to rows.
 *   2. Traceability (sourceEntityIds, sourceAssemblyIds) is preserved on ManufacturingParts.
 *   3. Documents are saved with their sheets payload intact.
 *   4. Quote totals are stored correctly.
 *   5. loadProject() reassembles everything in the correct structure.
 *
 * A real integration test against a live PostgreSQL should be run separately
 * using `DATABASE_URL=<real_db> npx jest --runInBand`.
 */

import { PersistenceService } from '../src/PersistenceService';
import { setAtlasDatabase } from '../src/AtlasDatabase';
import { EntityGraph, DocumentEntity } from '@atlas/types';
import { ManufacturingPart } from '@atlas/manufacturing-engine';
import { Quote } from '@atlas/cost-engine';

// ──────────────────────────────────────────────────────────
// Build minimal Golden Dataset fixtures
// ──────────────────────────────────────────────────────────

function buildMockEntityGraph(): EntityGraph {
  return {
    projects: {
      'proj-golden': { id: 'proj-golden', name: 'Industrial Building 50x70', version: 1 }
    },
    structuralSystems: {
      'sys-1': { id: 'sys-1', projectId: 'proj-golden', assemblyIds: ['asm-col-1', 'asm-beam-1'] }
    },
    assemblies: {
      'asm-col-1': { id: 'asm-col-1', name: 'Column Assembly', structuralSystemId: 'sys-1', componentIds: ['comp-1'] },
      'asm-beam-1': { id: 'asm-beam-1', name: 'Beam Assembly', structuralSystemId: 'sys-1', componentIds: ['comp-2'] }
    },
    components: {
      'comp-1': { id: 'comp-1', name: 'IPN120 Column', assemblyId: 'asm-col-1', elementIds: ['elem-1'] },
      'comp-2': { id: 'comp-2', name: 'IPN200 Beam', assemblyId: 'asm-beam-1', elementIds: ['elem-2'] }
    },
    elements: {
      'elem-1': { id: 'elem-1', componentId: 'comp-1', type: 'Extrusion', length: 7000, profile: 'IPN120' },
      'elem-2': { id: 'elem-2', componentId: 'comp-2', type: 'Extrusion', length: 5000, profile: 'IPN200' }
    },
    documents: {}
  } as unknown as EntityGraph;
}

function buildMockParts(): ManufacturingPart[] {
  return [
    {
      id: 'part-1',
      name: 'IPN120 Column Part',
      profile: 'IPN120',
      materialRef: 'S275JR',
      length: 7000,
      quantity: 14,
      operations: [
        { id: 'op-1', type: 'cutting', description: 'cut to length' },
        { id: 'op-2', type: 'drilling', description: 'base holes' }
      ] as any,
      sourceEntityIds: ['elem-1'],
      sourceAssemblyIds: ['asm-col-1']
    },
    {
      id: 'part-2',
      name: 'IPN200 Beam Part',
      profile: 'IPN200',
      materialRef: 'S275JR',
      length: 5000,
      quantity: 20,
      operations: [
        { id: 'op-3', type: 'welding', description: 'weld connections' }
      ] as any,
      sourceEntityIds: ['elem-2'],
      sourceAssemblyIds: ['asm-beam-1']
    }
  ];
}

function buildMockDocuments(): DocumentEntity[] {
  return [
    {
      id: 'doc-1',
      type: 'Document',
      title: 'IPN120 Column Part Sheet',
      documentType: 'ManufacturingPartSheet',
      revisionNumber: '1',
      createdAt: new Date().toISOString(),
      sourceProjectVersion: 1,
      sheetIds: []
    } as unknown as DocumentEntity
  ];
}

function buildMockQuote(): Quote {
  return {
    id: 'quote-1',
    projectId: 'proj-golden',
    createdAt: new Date().toISOString(),
    materialCosts: [
      { id: 'mc-1', type: 'Material', description: 'IPN120 Steel', profile: 'IPN120',
        length: 98000, weight: 1087.8, quantity: 14, pricePerUnit: 2.5, cost: 2719.5 }
    ],
    operationCosts: [
      { id: 'oc-1', type: 'Operation', description: 'cutting on IPN120', operationType: 'cutting',
        quantity: 14, pricePerOperation: 5.0, cost: 70, manufacturingPartId: 'part-1',
        sourceEntityId: 'elem-1', componentId: 'asm-col-1' }
    ],
    laborCosts: [],
    summary: {
      totalMaterialCost: 2719.5,
      totalOperationCost: 70,
      totalLaborCost: 0,
      totalCost: 2789.5
    }
  };
}

// ──────────────────────────────────────────────────────────
// In-memory Prisma mock
// ──────────────────────────────────────────────────────────

function buildMockPrisma() {
  const store: Record<string, any[]> = {
    projects: [], revisions: [], structuralEntities: [],
    manufacturingParts: [], documents: [], quotes: [], auditLogs: []
  };

  const mockTx = {
    projectRevision: {
      create: async (args: any) => {
        const row = { id: 'rev-1', ...args.data, structuralEntities: [], manufacturingParts: [], documents: [], quotes: [] };
        store.revisions.push(row);
        return row;
      }
    },
    structuralEntity: {
      createMany: async (args: any) => {
        store.structuralEntities.push(...args.data);
        return { count: args.data.length };
      }
    },
    manufacturingPart: {
      createMany: async (args: any) => {
        store.manufacturingParts.push(...args.data);
        return { count: args.data.length };
      }
    }
  };

  return {
    project: {
      create: async (args: any) => {
        const row = { id: 'proj-db-1', createdAt: new Date(), updatedAt: new Date(), ...args.data };
        store.projects.push(row);
        return row;
      },
      findUnique: async (args: any) => store.projects.find(p => p.id === args.where.id) ?? null,
      findMany: async () => store.projects,
      delete: async (args: any) => {
        const idx = store.projects.findIndex(p => p.id === args.where.id);
        return store.projects.splice(idx, 1)[0];
      }
    },
    projectRevision: {
      create: async (args: any) => {
        const row = { id: 'rev-1', ...args.data };
        store.revisions.push(row);
        return row;
      },
      findFirst: async (args: any) => {
        const rows = store.revisions.filter(r => r.projectId === args.where.projectId);
        if (!rows.length) return null;
        // Sort descending
        rows.sort((a, b) => b.revisionNumber - a.revisionNumber);
        const rev = rows[0];
        return {
          ...rev,
          structuralEntities: store.structuralEntities.filter(e => e.revisionId === rev.id),
          manufacturingParts: store.manufacturingParts.filter(p => p.revisionId === rev.id),
          documents: store.documents.filter(d => d.revisionId === rev.id),
          quotes: store.quotes.filter(q => q.revisionId === rev.id)
        };
      },
      findUnique: async () => null
    },
    structuralEntity: {
      createMany: async (args: any) => {
        store.structuralEntities.push(...args.data);
        return { count: args.data.length };
      }
    },
    manufacturingPart: {
      createMany: async (args: any) => {
        store.manufacturingParts.push(...args.data);
        return { count: args.data.length };
      }
    },
    document: {
      createMany: async (args: any) => {
        store.documents.push(...args.data);
        return { count: args.data.length };
      },
      findMany: async (args: any) => store.documents.filter(d => d.revisionId === args.where.revisionId)
    },
    quote: {
      create: async (args: any) => {
        const row = { createdAt: new Date(), ...args.data };
        store.quotes.push(row);
        return row;
      },
      findMany: async (args: any) => store.quotes.filter(q => q.revisionId === args.where.revisionId),
      findFirst: async (args: any) => store.quotes.find(q => q.projectId === args.where.projectId) ?? null
    },
    auditLog: {
      create: async (args: any) => {
        const row = { id: 'audit-' + Date.now(), timestamp: new Date(), ...args.data };
        store.auditLogs.push(row);
        return row;
      }
    },
    $transaction: async (fn: any) => fn(mockTx),
    $disconnect: async () => {}
  } as any;
}

// ──────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────

describe('PersistenceService — Golden Dataset roundtrip', () => {
  let service: PersistenceService;
  let mockDb: ReturnType<typeof buildMockPrisma>;

  beforeEach(() => {
    mockDb = buildMockPrisma();
    setAtlasDatabase(mockDb as any);
    service = new PersistenceService(mockDb as any);
  });

  it('should save a project and return projectId + revisionId', async () => {
    const result = await service.saveProject({
      projectName: 'Industrial Building 50x70',
      description: 'Golden Dataset',
      sourceProjectState: { width: 50000, length: 70000 },
      entityGraph: buildMockEntityGraph(),
      parts: buildMockParts(),
      documents: buildMockDocuments(),
      quote: buildMockQuote()
    });

    expect(result.projectId).toBeDefined();
    expect(result.revisionId).toBeDefined();
    expect(result.revisionNumber).toBe(1);
  });

  it('should persist structural entities for all EntityGraph layers', async () => {
    await service.saveProject({
      projectName: 'Industrial Building 50x70',
      sourceProjectState: {},
      entityGraph: buildMockEntityGraph(),
      parts: buildMockParts(),
      documents: [],
      quote: undefined
    });

    const loaded = await service.loadProject('proj-db-1');
    expect(loaded).not.toBeNull();

    // EntityGraph should have: 1 project + 1 sys + 2 assemblies + 2 components + 2 elements = 8 rows
    expect(loaded!.structuralEntities.length).toBe(8);

    const entityTypes = loaded!.structuralEntities.map(e => e.type);
    expect(entityTypes).toContain('Project');
    expect(entityTypes).toContain('StructuralSystem');
    expect(entityTypes).toContain('Assembly');
    expect(entityTypes).toContain('Component');
    expect(entityTypes).toContain('Element');
  });

  it('should preserve manufacturing part traceability (sourceEntityIds, sourceAssemblyIds)', async () => {
    await service.saveProject({
      projectName: 'Industrial Building 50x70',
      sourceProjectState: {},
      entityGraph: buildMockEntityGraph(),
      parts: buildMockParts(),
      documents: [],
      quote: undefined
    });

    const loaded = await service.loadProject('proj-db-1');
    expect(loaded!.manufacturingParts.length).toBe(2);

    const col = loaded!.manufacturingParts.find(p => p.profile === 'IPN120');
    expect(col).toBeDefined();
    expect(col!.sourceEntityIds).toContain('elem-1');
    expect(col!.sourceAssemblyIds).toContain('asm-col-1');
  });

  it('should persist documents with sheet payloads', async () => {
    await service.saveProject({
      projectName: 'Industrial Building 50x70',
      sourceProjectState: {},
      entityGraph: buildMockEntityGraph(),
      parts: [],
      documents: buildMockDocuments(),
      quote: undefined
    });

    const loaded = await service.loadProject('proj-db-1');
    expect(loaded!.documents.length).toBe(1);
    expect(loaded!.documents[0].documentType).toBe('ManufacturingPartSheet');
    expect(loaded!.documents[0].sheets).toBeDefined();
  });

  it('should persist quote with correct totals and cost items', async () => {
    const mockQuote = buildMockQuote();
    await service.saveProject({
      projectName: 'Industrial Building 50x70',
      sourceProjectState: {},
      entityGraph: buildMockEntityGraph(),
      parts: buildMockParts(),
      documents: [],
      quote: mockQuote
    });

    const loaded = await service.loadProject('proj-db-1');
    expect(loaded!.quotes.length).toBe(1);

    const q = loaded!.quotes[0];
    expect(q.totalCost).toBe(2789.5);
    expect(q.totalMaterialCost).toBe(2719.5);
    expect(q.totalOperationCost).toBe(70);
  });
});
