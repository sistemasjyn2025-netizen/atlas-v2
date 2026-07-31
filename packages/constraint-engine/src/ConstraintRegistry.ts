import { RulePack } from '@atlas/rulepack-engine';
import { ConstraintDefinition } from './ConstraintDefinition';

/**
 * Manages the specific constraint definitions for the Constraint Engine.
 * It is populated dynamically from an active RulePack.
 */
export class ConstraintRegistry {
  private rules: Map<string, ConstraintDefinition> = new Map();

  /**
   * Clears the current registry and populates it with constraint rules
   * from the provided RulePack.
   */
  public populateFrom(pack: RulePack<ConstraintDefinition, any, any, any, any>): void {
    this.rules.clear();
    const constraintRules = pack.getConstraintRules();
    for (const rule of constraintRules) {
      this.rules.set(rule.id, rule);
    }
  }

  /**
   * Register a specific rule manually (useful for testing or overrides).
   */
  public registerRule(rule: ConstraintDefinition): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Retrieves all registered constraint definitions.
   */
  public getAllRules(): ConstraintDefinition[] {
    return Array.from(this.rules.values());
  }
}
