export type FabricationOperationType = 'cutting' | 'drilling' | 'welding' | 'painting';

export interface FabricationOperation {
  id: string;
  type: FabricationOperationType;
  description: string;
}

export interface ManufacturingPart {
  id: string;
  name: string;
  profile: string;
  materialRef: string;
  length: number;
  quantity: number;
  operations: FabricationOperation[];
  
  // Traceability
  sourceEntityIds: string[]; // which components generated this part
  sourceAssemblyIds: string[]; // which assemblies it came from
}

export interface BOMEntry {
  profile: string;
  materialRef: string;
  totalLength: number;
  totalQuantity: number;
  estimatedWeightKg: number;
  paintAreaM2: number;
  parts: ManufacturingPart[]; // Traceability down to parts
}

export interface BOM {
  entries: BOMEntry[];
  totalEstimatedWeightKg: number;
}
