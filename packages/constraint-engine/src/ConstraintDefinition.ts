import { ConstraintCategory, ConstraintContext, ConstraintSeverity, RuleResult } from './types';

/**
 * ConstraintDefinition — the atomic unit of the Constraint Engine.
 *
 * Each definition is a self-contained rule carrying full metadata and a
 * pure `evaluate` function.
 */
export interface ConstraintDefinition {
  /** Globally unique rule identifier. Format: ATLAS-{CAT}-{NNN} */
  readonly id: string;

  /** Short human-readable name for the rule. */
  readonly name: string;

  /** Full description of what the rule validates. */
  readonly description: string;

  /** Semantic version of this rule definition. */
  readonly version: string;

  /** Author or authority that defines this rule. */
  readonly author: string;

  /** Engineering domain this rule belongs to. */
  readonly category: ConstraintCategory;

  /** Default severity when this rule is violated. */
  readonly severity: ConstraintSeverity;

  /** Optional URL to the full rule documentation. */
  readonly documentationUrl?: string;

  /**
   * Evaluates the rule against the provided context.
   *
   * @param context - The evaluation substrate.
   * @returns A RuleResult indicating if it passed, the violation, and metrics.
   */
  evaluate(context: ConstraintContext): RuleResult;
}
