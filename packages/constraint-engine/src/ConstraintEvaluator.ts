import { ConstraintDefinition } from './ConstraintDefinition';
import { ConstraintContext, RuleResult } from './types';

/**
 * Evaluates constraints against a given context.
 */
export class ConstraintEvaluator {
  /**
   * Evaluates a list of rules against the context safely.
   * Traps any exceptions thrown by rules to prevent fatal engine crashes,
   * returning them within the RuleResult.
   */
  public evaluateRules(context: ConstraintContext, rules: ConstraintDefinition[]): RuleResult[] {
    const results: RuleResult[] = [];

    for (const rule of rules) {
      const startTime = performance.now();
      try {
        const result = rule.evaluate(context);
        
        // Ensure execution time is tracked even if the rule author didn't set it accurately
        if (result.executionTime === undefined || result.executionTime === 0) {
          result.executionTime = performance.now() - startTime;
        }
        
        results.push(result);
      } catch (error) {
        const executionTime = performance.now() - startTime;
        
        // Return a synthetically failed result for rules that crash
        results.push({
          passed: false,
          executionTime,
          exception: error instanceof Error ? error : new Error(String(error)),
          violation: {
            id: `fatal-exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            ruleId: rule.id,
            category: rule.category,
            severity: 'Fatal',
            entityId: 'runtime',
            message: `Rule execution crashed: ${error instanceof Error ? error.message : String(error)}`,
            suggestion: 'Inspect the rule implementation for unhandled exceptions.',
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    return results;
  }
}
