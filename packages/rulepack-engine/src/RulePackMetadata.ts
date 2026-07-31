/**
 * Allows adding arbitrary metadata to a RulePack without breaking types.
 */
export interface RulePackMetadata {
  [key: string]: unknown;
}
