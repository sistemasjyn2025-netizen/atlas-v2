export interface AtlasProjectFile {
  version: '1.0';
  metadata: {
    name: string;
    description?: string;
  };
  building: {
    width: number;
    length: number;
    height: number;
    baySpacing: number;
    roofType: 'gable' | 'flat';
    roofSlope: number;
    structuralProfile: string;
    frontGates?: number;
    rearGates?: number;
    sideGates?: number;
  };
}

export interface PipelineResult {
  success: boolean;
  errors?: string[];
  projectId?: string;
  summary: {
    totalAssemblies: number;
    totalComponents: number;
    totalManufacturingParts: number;
    totalDocuments: number;
  };
  bom?: any; // To be mapped properly
  quote?: any; // To be mapped properly
  entityGraph?: any; // Contains full generated structural entities
  manufacturingParts?: any[]; // Full manufacturing parts
}
