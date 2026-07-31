export interface CostItem {
  id: string;
  manufacturingPartId?: string;
  componentId?: string;
  sourceEntityId?: string;
  description: string;
  cost: number;
}

export interface MaterialCost extends CostItem {
  type: 'Material';
  profile: string;
  length?: number;
  weight?: number;
  quantity: number;
  pricePerUnit: number;
}

export interface OperationCost extends CostItem {
  type: 'Operation';
  operationType: 'cutting' | 'drilling' | 'welding' | 'painting' | string;
  quantity: number;
  pricePerOperation: number;
}

export interface LaborCost extends CostItem {
  type: 'Labor';
  hours: number;
  ratePerHour: number;
}

export interface Quote {
  id: string;
  projectId: string;
  createdAt: string;
  materialCosts: MaterialCost[];
  operationCosts: OperationCost[];
  laborCosts: LaborCost[];
  summary: {
    totalMaterialCost: number;
    totalOperationCost: number;
    totalLaborCost: number;
    totalCost: number;
  };
}

export interface CostProject {
  id: string;
  quote: Quote;
}
