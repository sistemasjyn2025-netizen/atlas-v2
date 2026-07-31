import { CostEstimator } from '../src/CostEstimator';
import { DefaultCostRates } from '../src/CostRatesProvider';
import { BOM } from '@atlas/manufacturing-engine';

describe('CostEstimator', () => {
  it('should convert BOM to Quote correctly', () => {
    const rates = new DefaultCostRates();
    const estimator = new CostEstimator(rates);

    const mockBOM: BOM = {
      totalEstimatedWeightKg: 111,
      entries: [
        {
          profile: 'IPN120',
          materialRef: 'S275JR',
          totalLength: 10000,
          totalQuantity: 2,
          estimatedWeightKg: 111,
          parts: [
            {
              id: 'part1',
              name: 'Col1',
              profile: 'IPN120',
              materialRef: 'S275JR',
              length: 5000,
              quantity: 2,
              operations: [
                { id: 'op1', type: 'cutting', description: 'cut' },
                { id: 'op2', type: 'drilling', description: 'drill' },
                { id: 'op3', type: 'drilling', description: 'drill' }
              ],
              sourceEntityIds: ['elem1'],
              sourceAssemblyIds: ['asm1']
            }
          ]
        }
      ]
    };

    const quote = estimator.generateQuote('proj1', mockBOM);
    
    expect(quote).toBeDefined();
    expect(quote.projectId).toBe('proj1');
    expect(quote.materialCosts.length).toBe(1);
    expect(quote.materialCosts[0].profile).toBe('IPN120');
    expect(quote.materialCosts[0].cost).toBe(111 * 2.5); // 277.5
    
    expect(quote.operationCosts.length).toBe(3);
    expect(quote.operationCosts[0].operationType).toBe('cutting');
    expect(quote.operationCosts[0].quantity).toBe(2);
    expect(quote.operationCosts[0].cost).toBe(2 * 5.0); // 10.0
    
    expect(quote.summary.totalMaterialCost).toBe(277.5);
    expect(quote.summary.totalOperationCost).toBe(10.0 + 4 * 1.5); // 1 cut (2x qty) + 2 drills (2x qty = 4 holes) -> 10 + 6 = 16
    expect(quote.summary.totalCost).toBe(277.5 + 16);
    
    // Check traceability
    expect(quote.operationCosts[0].sourceEntityId).toBe('elem1');
    expect(quote.operationCosts[0].componentId).toBe('asm1');
  });
});
