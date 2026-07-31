import { ConstraintDefinition } from '../../ConstraintDefinition';
import { ConstraintCategory, ConstraintContext, ConstraintSeverity, RuleResult } from '../../types';

export class BaySpacingConstraint implements ConstraintDefinition {
  public readonly id = 'ATLAS-STR-001';
  public readonly name = 'Bay Spacing Constraint';
  public readonly description = 'Validates that the bay spacing is sensible given the building length.';
  public readonly version = '1.0.0';
  public readonly author = 'ATLAS Platform';
  public readonly category: ConstraintCategory = 'Structural';
  public readonly severity: ConstraintSeverity = 'Error'; 

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

    const length = context.project.building.length;
    const baySpacing = context.project.building.baySpacing;

    if (baySpacing <= 0) {
      return {
        passed: false,
        executionTime: performance.now() - startTime,
        violation: {
          id: `vio-${this.id}-${Date.now()}`,
          ruleId: this.id,
          category: this.category,
          severity: 'Fatal',
          entityId: 'building.baySpacing',
          message: `Bay spacing must be strictly positive. Received: ${baySpacing}`,
          suggestion: 'Set a positive bay spacing value (e.g., 5.0 or 6.0 meters).',
          timestamp: new Date().toISOString()
        }
      };
    }

    if (baySpacing > length) {
      return {
        passed: false,
        executionTime: performance.now() - startTime,
        violation: {
          id: `vio-${this.id}-${Date.now()}`,
          ruleId: this.id,
          category: this.category,
          severity: this.severity,
          entityId: 'building.baySpacing',
          message: `Bay spacing (${baySpacing}) cannot exceed building length (${length}).`,
          suggestion: 'Ensure bay spacing is smaller than or equal to the total length of the building.',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Checking if it's a multiple
    const remainder = length % baySpacing;
    // Allows small float inaccuracies
    if (remainder > 0.01 && Math.abs(baySpacing - remainder) > 0.01) {
      return {
        passed: false,
        executionTime: performance.now() - startTime,
        violation: {
          id: `vio-${this.id}-${Date.now()}`,
          ruleId: this.id,
          category: this.category,
          severity: 'Warning',
          entityId: 'building.baySpacing',
          message: `Building length (${length}) is not an exact multiple of bay spacing (${baySpacing}).`,
          suggestion: 'Adjust building length or bay spacing for even distribution.',
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
