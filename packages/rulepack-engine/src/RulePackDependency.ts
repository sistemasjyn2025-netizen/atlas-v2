/**
 * Defines a dependency on another RulePack or system component.
 */
export interface RulePackDependency {
  /** The ID of the required RulePack or component. */
  id: string;
  /** The semver range required (e.g., "^1.0.0"). */
  versionRange: string;
  /** Whether the engine can continue if this dependency is missing. */
  optional: boolean;
}
