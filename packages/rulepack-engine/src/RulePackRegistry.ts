import { RulePack } from './RulePack';

/**
 * Manages the registration and lifecycle of loaded RulePacks.
 * This registry holds all packs known to the system, but does NOT determine which one is active.
 */
export class RulePackRegistry {
  private packs: Map<string, RulePack<any, any, any, any, any>> = new Map();

  /**
   * Registers a loaded RulePack.
   */
  public register(pack: RulePack<any, any, any, any, any>): void {
    this.packs.set(pack.id, pack);
  }

  /**
   * Unregisters a RulePack by ID.
   */
  public unregister(packId: string): void {
    this.packs.delete(packId);
  }

  /**
   * Retrieves a RulePack by ID.
   */
  public get(packId: string): RulePack<any, any, any, any, any> | undefined {
    return this.packs.get(packId);
  }

  /**
   * Returns a list of all registered RulePacks.
   */
  public list(): RulePack<any, any, any, any, any>[] {
    return Array.from(this.packs.values());
  }

  /**
   * Checks if a RulePack is registered.
   */
  public exists(packId: string): boolean {
    return this.packs.has(packId);
  }
}
