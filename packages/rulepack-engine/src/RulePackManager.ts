import { RulePack } from './RulePack';
import { RulePackRegistry } from './RulePackRegistry';
import { RulePackLoader } from './RulePackLoader';
import { CompatibilityResult } from './types';

/**
 * The public facade for the RulePack Engine.
 * Manages the active rule pack and orchestrates loading.
 */
export class RulePackManager {
  private registry: RulePackRegistry;
  private loader: RulePackLoader;
  private activePackId: string | null = null;

  constructor() {
    this.registry = new RulePackRegistry();
    this.loader = new RulePackLoader(this.registry);
  }

  /**
   * Sets the active RulePack for the platform.
   */
  public setActive(packId: string): void {
    if (!this.registry.exists(packId)) {
      throw new Error(`Cannot set active pack: RulePack with ID '${packId}' is not registered.`);
    }
    this.activePackId = packId;
  }

  /**
   * Retrieves the currently active RulePack.
   * Engines will call this method and cast the result to their specific RulePack types.
   */
  public getActive(): RulePack<any, any, any, any, any> {
    if (!this.activePackId) {
      throw new Error('No active RulePack has been set.');
    }
    const pack = this.registry.get(this.activePackId);
    if (!pack) {
      throw new Error(`Active RulePack '${this.activePackId}' is missing from the registry.`);
    }
    return pack;
  }

  /**
   * Loads a local rule pack into the registry.
   */
  public async load(pack: RulePack<any, any, any, any, any>): Promise<void> {
    await this.loader.loadLocal(pack);
  }

  /**
   * Reloads a pack (placeholder for future hot-reloading).
   */
  public async reload(packId: string): Promise<void> {
    if (!this.registry.exists(packId)) {
      throw new Error(`Cannot reload: pack '${packId}' not found.`);
    }
    // In local mode, reloading might just mean resetting state.
    // Future: fetch from npm/API again.
  }

  /**
   * Validates compatibility of the active pack against platform versions.
   */
  public validateCompatibility(
    runtimeVersion: string,
    engineVersions: Record<string, string>,
    schemaVersion: string
  ): CompatibilityResult {
    const active = this.getActive();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic demonstration of compatibility check
    // In the real system, it would parse semver ranges from `active.dependencies`
    // and compare against runtimeVersion / engineVersions.
    if (!active.supportedProjectTypes || active.supportedProjectTypes.length === 0) {
      warnings.push('Active RulePack does not specify supported project types.');
    }

    return {
      isCompatible: errors.length === 0,
      errors,
      warnings
    };
  }
}
