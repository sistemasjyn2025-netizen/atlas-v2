import { DiagnosticSeverity } from '../projection/ProjectionDiagnostics';

export interface DrawingDiagnostic {
  code: string;
  message: string;
  entityId?: string;
  stage: string;
  severity: DiagnosticSeverity;
}

export class DrawingValidationResult {
  private diagnostics: DrawingDiagnostic[] = [];

  public add(diagnostic: DrawingDiagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  public getDiagnostics(): ReadonlyArray<DrawingDiagnostic> {
    return this.diagnostics;
  }

  public get hasErrors(): boolean {
    return this.diagnostics.some(d => d.severity === DiagnosticSeverity.Error);
  }
}
