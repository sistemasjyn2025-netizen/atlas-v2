import { Transform } from '@atlas/spatial-engine';

/**
 * Base entity for the graph
 */
export interface BaseEntity {
  id: string;
  type: string;
  transform?: Transform;
}

/**
 * Spatial definition (stub)
 */
export interface Geometry extends BaseEntity {
  type: 'Geometry';
  format?: 'Extrusion' | 'Hardware' | 'Box' | 'Generic';
  data?: {
    // Extrusion
    profile?: { type: string; width?: number; height?: number; depth?: number };
    depth?: number;
    // Hardware (bolts)
    diameter?: number;
    length?: number;
    // General
    [key: string]: any;
  };
}

/**
 * Specifications
 */
export interface Specification extends BaseEntity {
  type: 'Specification';
  specType: 'SteelProfile' | 'Sheet' | 'Hardware' | 'GenericManufacturing' | 'Connection';
}

export interface SteelProfileSpecification extends Specification {
  specType: 'SteelProfile';
  profile: string; // e.g. 'IPN120'
  length: number;  // e.g. 7000
  materialRef: string;
}

export interface SheetSpecification extends Specification {
  specType: 'Sheet';
  thickness: number;
  width?: number;
  length?: number;
  material: string;  // alias for materialRef
  materialRef?: string;
}

export interface HardwareSpecification extends Specification {
  specType: 'Hardware';
  hardwareType: string; // e.g. 'AnchorBolt'
  grade: string;        // e.g. 'F1554-36'
  diameter: number;     // in mm
  length: number;       // in mm
  standard?: string;    // e.g. 'DIN 933'
}

export interface GenericManufacturingSpecification extends Specification {
  specType: 'GenericManufacturing';
  description: string;
  materialRef?: string;
}

/**
 * Physical/Conceptual parts
 */
export interface Element extends BaseEntity {
  type: 'Element';
  geometryId?: string;
  materialId?: string;
  specificationId?: string;
}

/**
 * Group of elements
 */
export interface Component extends BaseEntity {
  type: 'Component';
  elementIds: string[];
  specificationId?: string;
}

/**
 * Group of components (New entity added)
 */
export interface Assembly extends BaseEntity {
  type: 'Assembly';
  componentIds: string[];
  subAssemblyIds: string[]; // Added
  connectionIds: string[];  // Added
}

export interface SubAssembly extends BaseEntity {
  type: 'SubAssembly';
  componentIds: string[];
}

export interface Connection extends BaseEntity {
  type: 'Connection';
  connectedEntityIds: string[]; // e.g. ids of a column and a beam
  jointId?: string;
}

export interface Joint extends BaseEntity {
  type: 'Joint';
  // definition of the physical connection (e.g. bolting, welding)
}

/**
 * A major structural system
 */
export interface StructuralSystem extends BaseEntity {
  type: 'StructuralSystem';
  assemblyIds: string[];
}

/**
 * The root project entity
 */
export interface Project extends BaseEntity {
  type: 'Project';
  name: string;
  client?: string;
  location?: string;
  norm?: string;
  version: number;
  structuralSystemIds: string[];
}

/**
 * Documents
 */
export interface Annotation extends BaseEntity {
  type: 'Annotation';
  text: string;
  position: { x: number, y: number };
}

export interface Dimension extends BaseEntity {
  type: 'Dimension';
  startPoint: { x: number, y: number };
  endPoint: { x: number, y: number };
  value: number;
  unit: string;
}

export interface View extends BaseEntity {
  type: 'View';
  viewType: 'front' | 'top' | 'side' | 'isometric' | 'detail';
  origin: { x: number, y: number, z: number };
  direction: { x: number, y: number, z: number };
  referencedEntityIds: string[];
  dimensionIds: string[];
  annotationIds: string[];
}

export interface Sheet extends BaseEntity {
  type: 'Sheet';
  scale: number;
  size: 'A4' | 'A3' | 'A2' | 'A1' | 'A0';
  viewIds: string[];
}

export interface DocumentEntity extends BaseEntity {
  type: 'Document';
  title: string;
  documentType: 'ManufacturingPartSheet' | 'AssemblyDrawing' | 'GeneralArrangement';
  revisionNumber: string;
  createdAt: string;
  sourceProjectVersion: number;
  sheetIds: string[];
}

export interface ConnectionRevision {
  revision: string;
  timestamp: string;
  author: string;
  description: string;
}

export type ConnectionState = 'Draft' | 'Generated' | 'Validated' | 'Manufacturing Ready' | 'Fabricated' | 'Installed' | 'Inspected';

export interface ConnectionSpecification extends Specification {
  specType: 'Connection';
  
  // Metadata
  connectionId: string;
  connectionType: 'BasePlate' | 'BeamColumn' | 'BeamBeam' | 'RoofRidge' | 'Knee' | 'Bracing' | 'Custom';
  rulePack: string;
  ruleId: string;
  revision: string;
  status: ConnectionState;
  revisions: ConnectionRevision[];
  
  // Materials & Geometry
  steelGrade: string;
  plateDimensions: { thickness: number; width: number; length: number }[];
  
  // Hardware
  boltLayout: { type: string, count: number, layoutGrid?: string };
  boltGrade: string;
  holeDiameter: number;
  pitch: number;
  gauge: number;
  edgeDistance: number;
  
  // Processes
  weldSpecification: string;
  paint: string;
  galvanization: string;
  
  // Metrics
  estimatedWeight: number;
  estimatedManufacturingTime: number;

  // Structural Analysis
  structuralAnalysis: {
    loads: any;
    moments: any;
    axialForce: number;
    shear: number;
    torsion: number;
  };
}

/**
 * Graph relations mapping
 */
export interface EntityGraph {
  projects: Record<string, Project>;
  structuralSystems: Record<string, StructuralSystem>;
  assemblies: Record<string, Assembly>;
  subAssemblies: Record<string, SubAssembly>;
  components: Record<string, Component>;
  elements: Record<string, Element>;
  geometries: Record<string, Geometry>;
  connections: Record<string, Connection>;
  joints: Record<string, Joint>;
  specifications: Record<string, Specification | ConnectionSpecification>;
  documents: Record<string, DocumentEntity>;
  sheets: Record<string, Sheet>;
  views: Record<string, View>;
  dimensions: Record<string, Dimension>;
  annotations: Record<string, Annotation>;
}
