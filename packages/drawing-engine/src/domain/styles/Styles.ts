export interface LayerStyle {
  id: string;
  name: string;
  color: string;
  lineWeight: number; // in mm
  lineType: string;
  visible: boolean;
}

export interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  italic: boolean;
  bold: boolean;
}

export interface DimensionStyle {
  id: string;
  name: string;
  textStyleId: string;
  arrowType: string;
  arrowSize: number;
  extensionLineOffset: number;
  dimensionLineColor: string;
}

export interface CompanyBranding {
  logoUrl?: string;
  companyName: string;
  primaryColor: string;
  titleBlockStyleId: string;
}
