import { RulePack } from './RulePack';
import { RulePackRegistry } from './RulePackRegistry';

/**
 * Responsible for loading RulePacks from various sources.
 * In v1, it only loads instances that are passed directly (local loading),
 * but is designed to support npm, plugins, and APIs in the future.
 */
export class RulePackLoader {
  constructor(private registry: RulePackRegistry) {}

  /**
   * Loads a local RulePack instance into the registry.
   */
  public async loadLocal(pack: RulePack<any, any, any, any, any>): Promise<void> {
    this.registry.register(pack);
  }

  // Future implementations:
  // public async loadFromNpm(packageName: string): Promise<void> { ... }
  // public async loadFromApi(url: string): Promise<void> { ... }
}
