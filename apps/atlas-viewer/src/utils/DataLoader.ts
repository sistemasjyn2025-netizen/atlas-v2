import { AtlasPipeline } from '@atlas/runtime';
import { AtlasToRenderAdapter } from '@atlas/renderer-core';
import type { PipelineResult } from '@atlas/runtime';

export class DataLoader {
  static convertToRenderable(result: PipelineResult) {
    if (!result.success || !result.entityGraph) {
      throw new Error("Cannot convert failed pipeline result");
    }

    const adapter = new AtlasToRenderAdapter();
    const renderResult = adapter.convert(result.entityGraph);

    for (const mapping of renderResult.selectionMap.values()) {
      const part = result.manufacturingParts?.find(p => 
        p.sourceEntityIds?.includes(mapping.sourceEntityId) || 
        p.sourceAssemblyIds?.includes(mapping.sourceEntityId)
      );

      if (part) {
        const costOp = result.quote?.operationCosts?.find((c: any) => c.manufacturingPartId === part.id);
        const costMat = result.quote?.materialCosts?.find((c: any) => c.profile === part.profile);

        mapping.manufacturingData = {
          partId: part.id,
          name: part.name,
          profile: part.profile,
          length: part.length,
          quantity: part.quantity,
          operations: part.operations,
          costInformation: {
             operationCost: costOp?.cost || 0,
             estimatedMaterialUnitCost: costMat?.pricePerUnit || 0
          }
        };
      }
    }
    
    return { renderResult, pipelineResult: result };
  }
}
