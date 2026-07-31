import { BOMGenerator } from '../src/BOMGenerator';
import { ManufacturingPart } from '../src/types';

describe('BOMGenerator', () => {
  it('should generate correct BOM from parts', () => {
    const parts: ManufacturingPart[] = [
      {
        id: '1',
        name: 'Column',
        profile: 'IPN200',
        materialRef: 'S275',
        length: 5000, // 5m
        quantity: 4,
        operations: [],
        sourceEntityIds: [],
        sourceAssemblyIds: []
      },
      {
        id: '2',
        name: 'Beam',
        profile: 'IPN160',
        materialRef: 'S275',
        length: 6000, // 6m
        quantity: 2,
        operations: [],
        sourceEntityIds: [],
        sourceAssemblyIds: []
      }
    ];

    const generator = new BOMGenerator();
    const bom = generator.generateBOM(parts);

    expect(bom.entries.length).toBe(2);
    
    const colEntry = bom.entries.find(e => e.profile === 'IPN200');
    expect(colEntry?.totalQuantity).toBe(4);
    expect(colEntry?.totalLength).toBe(20000); // 5000 * 4
    
    // IPN200 weight is 26.2 kg/m. 20m * 26.2 = 524kg
    expect(colEntry?.estimatedWeightKg).toBeCloseTo(524, 0);

    const beamEntry = bom.entries.find(e => e.profile === 'IPN160');
    expect(beamEntry?.totalQuantity).toBe(2);
    expect(beamEntry?.totalLength).toBe(12000); // 6000 * 2
    
    // IPN160 weight is 17.9 kg/m. 12m * 17.9 = 214.8kg
    expect(beamEntry?.estimatedWeightKg).toBeCloseTo(214.8, 1);

    expect(bom.totalEstimatedWeightKg).toBeCloseTo(524 + 214.8, 1);
  });
});
