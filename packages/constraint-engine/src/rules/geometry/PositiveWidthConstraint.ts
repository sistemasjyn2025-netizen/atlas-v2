import { ConstraintDefinition } from '../../ConstraintDefinition';
import { ConstraintCategory, ConstraintContext, ConstraintSeverity, RuleResult } from '../../types';

export class PositiveWidthConstraint implements ConstraintDefinition {
  public readonly id = 'ATLAS-GEO-001';
  public readonly name = 'Positive Width Constraint';
  public readonly description = 'Validates that the building width is greater than 0.';
  public readonly version = '1.0.0';
  public readonly author = 'ATLAS Platform';
  public readonly category: ConstraintCategory = 'Geometry';
  public readonly severity: ConstraintSeverity = 'Fatal'; // A building with <= 0 width cannot be generated

  public evaluate(context: ConstraintContext): RuleResult {
    const startTime = performance.now();

    if (!context.project) {
      return {
        passed: false,
        executionTime: performance.now() - startTime,
        violation: {
          id: `vio-${this.id}-${Date.now()}`,
          ruleId: this.id,
          category: this.category,
          severity: 'Critical',
          entityId: 'project',
          message: 'Project context is missing.',
          suggestion: 'Ensure the project context is provided to the constraint engine.',
          timestamp: new Date().toISOString()
        }
      };
    }

    const width = context.project.building.width;

    if (width <= 0) {
      return {
        passed: false,
        executionTime: performance.now() - startTime,
        violation: {
          id: `vio-${this.id}-${Date.now()}`,
          ruleId: this.id,
          category: this.category,
          severity: this.severity,
          entityId: 'building.width',
          message: `Building width must be strictly positive. Received: ${width}`,
          suggestion: 'Update the building width to a positive number (e.g., 20.0).',
          timestamp: new Date().toISOString()
        }
      };
    }

    return {
      passed: true,
      executionTime: performance.now() - startTime
    };
  }
}
