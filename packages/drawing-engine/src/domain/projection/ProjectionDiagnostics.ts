export enum DiagnosticSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error'
}

export interface ProjectionDiagnostic {
  code: string;
  message: string;
  entityId?: string;
  stage: string;
  severity: DiagnosticSeverity;
}

export interface ProjectionStatistics {
  originalEntityCount: number;
  projectedEntityCount: number;
  clippedEntityCount: number;
  hiddenLineCount: number;
  executionTimeMs: number;
}
