import { RulePackManager, RulePack } from '../src';

describe('RulePackManager', () => {
  let manager: RulePackManager;

  beforeEach(() => {
    manager = new RulePackManager();
  });

  it('should register and retrieve a pack correctly', async () => {
    const dummyPack: RulePack<any, any, any, any, any> = {
      id: 'dummy-pack',
      name: 'Dummy Pack',
      description: 'Dummy',
      version: '1.0.0',
      author: 'Test',
      organization: 'Test',
      supportedProjectTypes: ['DummyType'],
      dependencies: [],
      metadata: {},
      getConstraintRules: () => [],
      getConnectionRules: () => [],
      getManufacturingRules: () => [],
      getCostRules: () => [],
      getDocumentRules: () => []
    };

    await manager.load(dummyPack);
    manager.setActive(dummyPack.id);

    const active = manager.getActive();
    expect(active.id).toBe('dummy-pack');
  });

  it('should throw when trying to set an active pack that does not exist', () => {
    expect(() => manager.setActive('missing')).toThrow();
  });

  it('should throw when getting active if none is set', () => {
    expect(() => manager.getActive()).toThrow();
  });

  it('should validate compatibility', async () => {
    const dummyPack: RulePack<any, any, any, any, any> = {
      id: 'dummy-pack',
      name: 'Dummy',
      description: 'Dummy',
      version: '1.0.0',
      author: 'Test',
      organization: 'Test',
      supportedProjectTypes: [], // Missing project types for warning
      dependencies: [],
      metadata: {},
      getConstraintRules: () => [],
      getConnectionRules: () => [],
      getManufacturingRules: () => [],
      getCostRules: () => [],
      getDocumentRules: () => []
    };

    await manager.load(dummyPack);
    manager.setActive(dummyPack.id);

    const result = manager.validateCompatibility('1.0', {}, '1.0');
    expect(result.isCompatible).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
