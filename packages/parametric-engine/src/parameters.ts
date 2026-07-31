export type RoofType = 'flat' | 'gable' | 'monopitch';

export interface IndustrialBuildingParameters {
  width: number;       // in meters
  length: number;      // in meters
  height: number;      // in meters
  roofType: RoofType;  // Type of roof
  roofSlope: number;   // Slope in degrees (or percentage, let's use degrees)
  baySpacing: number;  // Distance between frames in meters
  structuralProfile: string; // e.g. 'IPE400', 'W12x26'
  mainProfileId?: string;
}
