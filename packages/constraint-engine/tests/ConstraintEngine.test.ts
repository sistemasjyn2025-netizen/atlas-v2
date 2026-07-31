import { ConstraintEngine, ConstraintRegistry, AtlasStandardPack, ConstraintContext, ConstraintDefinition, RuleResult } from '../src';
import { RulePackManager, RulePack } from '@atlas/rulepack-engine';

describe('ConstraintEngine', () => {
  let rulePackManager: RulePackManager;
  let engine: ConstraintEngine;

  beforeEach(() => {
    rulePackManager = new RulePackManager();
    engine = new ConstraintEngine(rulePackManager);
  });

  it('evaluates a valid project successfully with AtlasStandardPack', async () => {
    const pack = new AtlasStandardPack();
    await rulePackManager.load(pack);
    rulePackManager.setActive(pack.id);
    
    const context: ConstraintContext = {
      project: {
        version: '1.0',
        building: {
          width: 50,
          length: 70,
          height: 10,
          baySpacing: 10,
          roofType: 'Gable',
          roofSlope: 10,
          structuralProfile: 'IPN200'
        }
      }
    };

    const report = engine.execute(context);
    
    expect(report.valid).toBe(true);
    expect(report.totalRules).toBeGreaterThan(0);
    expect(report.failedRules).toBe(0);
    expect(report.warnings).toBe(0);
    expect(report.fatal).toBe(0);
  });

  it('detects a fatal error when width is negative', async () => {
    const pack = new AtlasStandardPack();
    await rulePackManager.load(pack);
    rulePackManager.setActive(pack.id);
    
    const context: ConstraintContext = {
      project: {
        version: '1.0',
        building: {
          width: -5, // Invalid width
          length: 70,
          height: 10,
          baySpacing: 10,
          roofType: 'Gable',
          roofSlope: 10,
          structuralProfile: 'IPN200'
        }
      }
    };

    const report = engine.execute(context);
    
    expect(report.valid).toBe(false);
    expect(report.failedRules).toBeGreaterThan(0);
    expect(report.fatal).toBe(1); // PositiveWidthConstraint throws Fatal
    expect(report.violations[0].entityId).toBe('building.width');
  });

  it('traps exceptions thrown by rogue rules and treats them as fatal', async () => {
    class RogueRule implements ConstraintDefinition {
      id = 'ROGUE-001';
      name = 'Rogue Rule';
      description = 'Throws an error';
      version = '1.0';
      author = 'Test';
      category = 'Geometry' as const;
      severity = 'Info' as const;

      evaluate(context: ConstraintContext): RuleResult {
        throw new Error('Unexpected crash');
      }
    }

    const roguePack: RulePack<ConstraintDefinition, never, never, never, never> = {
      id: 'rogue-pack',
      name: 'Rogue Pack',
      description: 'Rogue',
      version: '1.0',
      author: 'Test',
      organization: 'Test',
      supportedProjectTypes: [],
      dependencies: [],
      metadata: {},
      getConstraintRules: () => [new RogueRule()],
      getConnectionRules: () => [],
      getManufacturingRules: () => [],
      getCostRules: () => [],
      getDocumentRules: () => []
    };

    await rulePackManager.load(roguePack);
    rulePackManager.setActive(roguePack.id);

    const report = engine.execute({});
    
    expect(report.valid).toBe(false);
    expect(report.fatal).toBe(1);
    expect(report.violations[0].message).toContain('Unexpected crash');
  });
});
