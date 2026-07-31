import { BOM, BOMEntry, ManufacturingPart } from './types';

// Very basic weight lookup table (kg/m)
const WEIGHT_LOOKUP: Record<string, number> = {
  'IPN120': 11.1,
  'IPN140': 14.3,
  'IPN160': 17.9,
  'IPN200': 26.2,
  'HEA140': 24.7,
  'HEB200': 61.3,
  'Tube_100x100x3': 9.0
};

const PERIMETER_LOOKUP: Record<string, number> = {
  'IPN120': 0.45,
  'IPN140': 0.52,
  'IPN160': 0.59,
  'IPN200': 0.73,
  'HEA140': 0.83,
  'HEB200': 1.15,
  'Tube_100x100x3': 0.40
};

export class BOMGenerator {
  public generateBOM(parts: ManufacturingPart[], abortSignal?: AbortSignal): BOM {
    const entriesMap: Map<string, BOMEntry> = new Map();

    for (const part of parts) {
      if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError');
      
      const key = `${part.profile}-${part.materialRef}`;
      
      if (!entriesMap.has(key)) {
        entriesMap.set(key, {
          profile: part.profile,
          materialRef: part.materialRef,
          totalLength: 0,
          totalQuantity: 0,
          estimatedWeightKg: 0,
          paintAreaM2: 0,
          parts: []
        });
      }

      const entry = entriesMap.get(key)!;
      entry.parts.push(part);
      entry.totalLength += (part.length * part.quantity);
      entry.totalQuantity += part.quantity;
      
      const weightPerMeter = WEIGHT_LOOKUP[part.profile] || 10.0; // fallback to 10kg/m
      const perimeterM = PERIMETER_LOOKUP[part.profile] || 0.3; // fallback to 0.3m perimeter
      
      entry.estimatedWeightKg += (part.length / 1000) * weightPerMeter * part.quantity;
      entry.paintAreaM2 += (part.length / 1000) * perimeterM * part.quantity;
    }

    let totalWeight = 0;
    const entries = Array.from(entriesMap.values());
    for (const entry of entries) {
      totalWeight += entry.estimatedWeightKg;
    }

    return {
      entries,
      totalEstimatedWeightKg: totalWeight
    };
  }
}
