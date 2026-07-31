import { BOM, ManufacturingPart } from '@atlas/manufacturing-engine';
import { Quote, MaterialCost, OperationCost } from './types';
import { CostRatesProvider } from './CostRatesProvider';
import { v4 as uuidv4 } from 'uuid';

export class CostEstimator {
  constructor(private ratesProvider: CostRatesProvider) {}

  public generateQuote(projectId: string, bom: BOM, abortSignal?: AbortSignal): Quote {
    const materialCosts: MaterialCost[] = [];
    const operationCosts: OperationCost[] = [];
    let totalPaintArea = 0;

    // Calculate Materials from BOM Entries
    for (const item of bom.entries) {
      if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError');
      
      const weightPerM = this.ratesProvider.getWeightPerMeter(item.profile);
      const totalLengthM = item.totalLength / 1000;
      const totalWeightKg = item.estimatedWeightKg || (totalLengthM * weightPerM);
      const rate = this.ratesProvider.getMaterialRate(item.profile);
      
      const cost = totalWeightKg * rate;
      
      materialCosts.push({
        id: uuidv4(),
        type: 'Material',
        description: `Material: ${item.profile}`,
        profile: item.profile,
        length: item.totalLength,
        weight: totalWeightKg,
        quantity: item.totalQuantity,
        pricePerUnit: rate,
        cost: cost
      });

      totalPaintArea += (item.paintAreaM2 || 0);

      // Process individual parts inside entry for operations & traceability
      for (const part of item.parts) {
        for (const op of part.operations) {
          const opRate = this.ratesProvider.getOperationRate(op.type);
          const qty = part.quantity; // Operation quantity is bounded to part quantity
          const cost = opRate * qty;
          
          operationCosts.push({
            id: uuidv4(),
            type: 'Operation',
            description: `${op.type} on ${part.name}`,
            operationType: op.type,
            quantity: qty,
            pricePerOperation: opRate,
            cost: cost,
            manufacturingPartId: part.id,
            sourceEntityId: part.sourceEntityIds?.[0], // Taking the primary for simplicity
            componentId: part.sourceAssemblyIds?.[0]
          });
        }
      }
    }

    // Add global painting operation cost
    const paintRate = this.ratesProvider.getOperationRate('painting') || 4.5;
    const globalPaintCost = totalPaintArea * paintRate;
    operationCosts.push({
      id: uuidv4(),
      type: 'Operation',
      description: 'Global Painting',
      operationType: 'painting',
      quantity: totalPaintArea,
      pricePerOperation: paintRate,
      cost: globalPaintCost
    });

    // Sum totals
    const totalMaterialCost = materialCosts.reduce((acc, curr) => acc + curr.cost, 0);
    const totalOperationCost = operationCosts.reduce((acc, curr) => acc + curr.cost, 0);
    
    // Engineering hours based on weight (1 hr per 10 ton)
    const engHours = Math.max(8, (bom.totalEstimatedWeightKg / 10000) * 1);
    const engRate = 80;
    const totalLaborCost = engHours * engRate;

    const quote: Quote = {
      id: uuidv4(),
      projectId,
      createdAt: new Date().toISOString(),
      materialCosts,
      operationCosts,
      laborCosts: [],
      summary: {
        totalMaterialCost,
        totalOperationCost,
        totalLaborCost,
        totalCost: totalMaterialCost + totalOperationCost + totalLaborCost
      }
    };

    return quote;
  }
}
