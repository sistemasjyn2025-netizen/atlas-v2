/**
 * @atlas/constraint-engine — Core Types
 *
 * Defines the fundamental domain model for the ATLAS Constraint Engine.
 */

export type ConstraintSeverity = 'Info' | 'Warning' | 'Error' | 'Critical' | 'Fatal';

export type ConstraintCategory =
  | 'Geometry'
  | 'Structural'
  | 'Manufacturing'
  | 'Cost'
  | 'RulePack'
  | 'Documentation';

export interface BuildingParameters {
  width: number;
  length: number;
  height: number;
  baySpacing: number;
  roofType: string;
  roofSlope: number;
  structuralProfile: string;
  frontGates?: number;
  rearGates?: number;
  sideGates?: number;
}

export interface ProjectInput {
  version: string;
  metadata?: {
    name?: string;
    description?: string;
    [key: string]: unknown;
  };
  building: BuildingParameters;
}

export interface ConstraintContext {
  project?: ProjectInput;
  entityGraph?: unknown;
  manufacturing?: unknown;
  quote?: unknown;
  documents?: unknown;
  runtime?: unknown;
}

export interface ConstraintViolation {
  id: string;
  ruleId: string;
  category: ConstraintCategory;
  severity: ConstraintSeverity;
  entityId: string;
  message: string;
  suggestion: string;
  timestamp: string;
}

/**
 * Result of evaluating a single rule.
 */
export interface RuleResult {
  passed: boolean;
  violation?: ConstraintViolation;
  executionTime: number;
  exception?: Error;
}

export interface ConstraintReport {
  valid: boolean;
  engineVersion: string;
  rulePack: string;
  
  // Metrics
  executionTime: number;
  totalRules: number;
  evaluatedRules: number;
  passedRules: number;
  failedRules: number;
  skippedRules: number;
  
  // Violation counts
  warnings: number;
  errors: number;
  critical: number;
  fatal: number;
  
  violations: ConstraintViolation[];
}
