import { EntityManager } from '@atlas/kernel';
import { IndustrialBuildingBlueprint } from '../src/blueprints/IndustrialBuildingBlueprint';
import { PartExtractor, BOMGenerator } from '@atlas/manufacturing-engine';

describe('ManufacturingIntegration', () => {
  let entityManager: EntityManager;
  
  beforeEach(() => {
    entityManager = new EntityManager();
  });

  it('should generate building and extract correct BOM (Golden Dataset)', () => {
    const project = entityManager.createProject('Test Building');
    const blueprint = new IndustrialBuildingBlueprint();
    
    // Generate the 50x70 golden dataset building
    blueprint.generate({
      width: 50000,
      length: 70000,
      height: 8000,
      baySpacing: 5000,
      roofType: 'gable',
      roofSlope: 10,
      structuralProfile: 'IPN200'
    }, entityManager, project.id);

    const extractor = new PartExtractor(entityManager);
    const parts = extractor.extractFromProject(project.id);
    
    const generator = new BOMGenerator();
    const bom = generator.generateBOM(parts);
    
    expect(bom.entries.length).toBeGreaterThan(0);
    
    const columns = bom.entries.find(e => e.profile === 'IPN200');
    expect(columns).toBeDefined();
    expect(columns?.totalQuantity).toBe(30);
    expect(columns?.totalLength).toBe(30 * 8000); // 30 columns * 8m
    
    const roofBeams = bom.entries.find(e => e.profile === 'IPN160');
    expect(roofBeams).toBeDefined();
    expect(roofBeams?.totalQuantity).toBe(30);

    const gates = bom.entries.find(e => e.profile === 'Tube_100x100x3');
    expect(gates).toBeDefined();
    // 3 front + 3 rear + 2 (double leaf side) = 8 gates total
    expect(gates?.totalQuantity).toBe(8);
  });
});
