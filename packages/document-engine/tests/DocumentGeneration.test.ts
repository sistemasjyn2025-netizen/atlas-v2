import { EntityManager } from '@atlas/kernel';
import { IndustrialBuildingBlueprint } from '@atlas/parametric-engine';
import { PartExtractor } from '@atlas/manufacturing-engine';
import { ManufacturingPartSheetGenerator } from '../src/generators/ManufacturingPartSheetGenerator';
import { AssemblyDrawingGenerator } from '../src/generators/AssemblyDrawingGenerator';

describe('Document Generation', () => {
  let entityManager: EntityManager;

  beforeEach(() => {
    entityManager = new EntityManager();
  });

  it('should generate documentation from the Golden Dataset', () => {
    const project = entityManager.createProject('Golden Dataset Project');
    const blueprint = new IndustrialBuildingBlueprint();
    
    // 1. Generate 50x70 building
    blueprint.generate({
      width: 50000,
      length: 70000,
      height: 8000,
      baySpacing: 5000,
      roofType: 'gable',
      roofSlope: 10,
      structuralProfile: 'IPN200'
    }, entityManager, project.id);

    // 2. Extract Manufacturing Parts
    const extractor = new PartExtractor(entityManager);
    const parts = extractor.extractFromProject(project.id);
    
    expect(parts.length).toBeGreaterThan(0);

    const graph = entityManager.getGraph();

    // 3. Generate Part Sheet for the first extracted part (e.g. Column)
    const partSheetGen = new ManufacturingPartSheetGenerator(entityManager);
    const partDoc = partSheetGen.generate(parts[0], project.version);
    
    expect(partDoc).toBeDefined();
    expect(partDoc.documentType).toBe('ManufacturingPartSheet');
    expect(partDoc.revisionNumber).toBe('0');
    expect(partDoc.sourceProjectVersion).toBe(project.version);
    
    expect(partDoc.sheetIds.length).toBe(1);
    const sheet = graph.sheets[partDoc.sheetIds[0]];
    expect(sheet).toBeDefined();
    expect(sheet.size).toBe('A4');
    expect(sheet.viewIds.length).toBe(1);
    
    const view = graph.views[sheet.viewIds[0]];
    expect(view).toBeDefined();
    expect(view.referencedEntityIds.length).toBeGreaterThan(0);
    // Traceability to assembly/component
    expect(view.referencedEntityIds).toEqual(
      expect.arrayContaining([...parts[0].sourceEntityIds, ...parts[0].sourceAssemblyIds])
    );

    // 4. Generate Assembly Drawing for a Frame
    const structuralSystem = graph.structuralSystems[project.structuralSystemIds[0]];
    const frameAssemblyId = structuralSystem.assemblyIds[0];

    const assemblyGen = new AssemblyDrawingGenerator(entityManager);
    const asmDoc = assemblyGen.generate(frameAssemblyId, project.version, 'Main Frame');
    
    expect(asmDoc).toBeDefined();
    expect(asmDoc.documentType).toBe('AssemblyDrawing');
    
    expect(asmDoc.sheetIds.length).toBe(1);
    const asmSheet = graph.sheets[asmDoc.sheetIds[0]];
    expect(asmSheet.size).toBe('A3');
    expect(asmSheet.viewIds.length).toBe(2); // Front and Top views
    
    const frontView = graph.views[asmSheet.viewIds[0]];
    expect(frontView.viewType).toBe('front');
    // Frame has 2 columns, 2 roof beams = 4 components
    expect(frontView.referencedEntityIds.length).toBe(4);
  });
});
