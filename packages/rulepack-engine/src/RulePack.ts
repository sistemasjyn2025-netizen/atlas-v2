import { RulePackDependency } from './RulePackDependency';
import { RulePackMetadata } from './RulePackMetadata';

/**
 * Represents a complete engineering standard or set of rules (e.g., ATLAS Standard, CIRSOC, AISC).
 * It is completely generic and does not depend on any specific engine's rule definitions.
 */
export interface RulePack<
  TConstraint = unknown,
  TConnection = unknown,
  TManufacturing = unknown,
  TCost = unknown,
  TDocument = unknown
> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly organization: string;
  readonly supportedProjectTypes: string[];
  readonly dependencies: RulePackDependency[];
  readonly metadata: RulePackMetadata;

  getConstraintRules(): readonly TConstraint[];
  getConnectionRules(): readonly TConnection[];
  getManufacturingRules(): readonly TManufacturing[];
  getCostRules(): readonly TCost[];
  getDocumentRules(): readonly TDocument[];
}
