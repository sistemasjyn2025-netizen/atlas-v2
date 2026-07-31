import { RulePackManager } from '@atlas/rulepack-engine';
import { ConstraintContext, ConstraintReport, ConstraintViolation, RuleResult } from './types';
import { ConstraintRegistry } from './ConstraintRegistry';
import { ConstraintEvaluator } from './ConstraintEvaluator';
import { ConstraintDefinition } from './ConstraintDefinition';

/**
 * The orchestrator for the ATLAS Constraint Engine.
 */
export class ConstraintEngine {
  private evaluator: ConstraintEvaluator;
  private registry: ConstraintRegistry;

  constructor(private rulePackManager: RulePackManager) {
    this.evaluator = new ConstraintEvaluator();
    this.registry = new ConstraintRegistry();
  }

  /**
   * Executes all registered constraints against the provided context
   * and generates a comprehensive report.
   */
  public execute(context: ConstraintContext): ConstraintReport {
    const startTime = performance.now();
    
    // 1. Get active rule pack from the central RulePackManager
    // Cast it since ConstraintEngine expects ConstraintDefinition in the first generic argument
    const activePack = this.rulePackManager.getActive() as any; 
    
    // 2. Populate the local registry
    this.registry.populateFrom(activePack);

    const rules = this.registry.getAllRules();
    
    const results = this.evaluator.evaluateRules(context, rules);
    
    let passedRules = 0;
    let failedRules = 0;
    let warnings = 0;
    let errors = 0;
    let critical = 0;
    let fatal = 0;
    const violations: ConstraintViolation[] = [];

    for (const result of results) {
      if (result.passed) {
        passedRules++;
      } else {
        failedRules++;
        if (result.violation) {
          violations.push(result.violation);
          switch (result.violation.severity) {
            case 'Info':
              break;
            case 'Warning':
              warnings++;
              break;
            case 'Error':
              errors++;
              break;
            case 'Critical':
              critical++;
              break;
            case 'Fatal':
              fatal++;
              break;
          }
        }
      }
    }

    // Sort violations by severity (Fatal > Critical > Error > Warning > Info)
    const severityWeight = {
      Fatal: 5,
      Critical: 4,
      Error: 3,
      Warning: 2,
      Info: 1
    };
    
    violations.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

    const executionTime = performance.now() - startTime;
    const valid = (errors === 0 && critical === 0 && fatal === 0);

    return {
      valid,
      engineVersion: '1.0.0', 
      rulePack: activePack.name,
      executionTime,
      totalRules: rules.length,
      evaluatedRules: rules.length, 
      passedRules,
      failedRules,
      skippedRules: 0,
      warnings,
      errors,
      critical,
      fatal,
      violations
    };
  }
}
