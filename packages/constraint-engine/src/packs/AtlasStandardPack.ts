import { RulePack } from '@atlas/rulepack-engine';
import { ConstraintDefinition } from '../ConstraintDefinition';
import { PositiveWidthConstraint } from '../rules/geometry/PositiveWidthConstraint';
import { BaySpacingConstraint } from '../rules/structural/BaySpacingConstraint';

/**
 * The standard constraint pack for ATLAS.
 * Includes general geometry, structural, manufacturing, and cost rules.
 */
export class AtlasStandardPack implements RulePack<ConstraintDefinition, never, never, never, never> {
  public readonly id = 'atlas-standard-pack';
  public readonly name = 'ATLAS Standard Constraints';
  public readonly description = 'Standard baseline constraints for ATLAS parametric buildings.';
  public readonly version = '1.0.0';
  public readonly author = 'ATLAS Platform';
  public readonly organization = 'ATLAS Systems';
  public readonly supportedProjectTypes = ['IndustrialBuildingBlueprint'];
  public readonly dependencies = [];
  public readonly metadata = {};

  private rules: ConstraintDefinition[];

  constructor() {
    this.rules = [
      new PositiveWidthConstraint(),
      new BaySpacingConstraint()
      // Further rules (manufacturing, cost, documentation) can be added here
    ];
  }

  public getConstraintRules(): readonly ConstraintDefinition[] {
    return this.rules;
  }

  public getConnectionRules(): readonly never[] { return []; }
  public getManufacturingRules(): readonly never[] { return []; }
  public getCostRules(): readonly never[] { return []; }
  public getDocumentRules(): readonly never[] { return []; }
}
