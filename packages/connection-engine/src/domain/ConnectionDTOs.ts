export interface IConnectionDetail {
  nodeId: string;
  type: 'BasePlate' | 'Apex' | 'Eaves' | 'Splice';
  plates: ISteelPlate[];
  boltGroups: IBoltGroup[];
  copes: ICopingInstruction[]; 
}

export interface ISteelPlate {
  id: string;
  thickness: number;
  polygon2d: { x: number, y: number }[]; // En el espacio local Z=0 (ideal para exportar a DXF)
  transform: Float32Array; // Matriz 4x4 de posicionamiento global
}

export interface IBoltGroup {
  id: string;
  boltStandard: string; // ej. "A325 M20"
  diameter: number; // Diámetro del perno para renderizado 3D
  holeDiameter: number; // Diámetro del agujero para tolerancias CNC (ej. 22mm para perno de 20mm)
  localCoordinates: { x: number, y: number, z: number }[]; // Posiciones relativas a la placa
  globalTransform: Float32Array; 
}

export interface ICopingInstruction {
  targetMemberId: string;
  cutPlanePosition: number; // Dónde rebajar
  depth: number;
  // Granularidad del despunte real:
  copeType: 'top_flange' | 'bottom_flange' | 'web_hole' | 'flush';
}

export interface INodeTopology {
  nodeId: string;
  isSupportNode: boolean;
  members: {
    id: string;
    profile: { width: number; height: number }; // Simplificado para este ejemplo
    role: 'column' | 'beam' | 'brace';
    direction: { x: number, y: number, z: number };
  }[];
}
