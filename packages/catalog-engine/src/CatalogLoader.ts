import { CatalogProvider } from './CatalogProvider';
import { CatalogCache } from './CatalogCache';
import { CatalogRegistry } from './CatalogRegistry';
import { CatalogCategory } from './types';

/**
 * Responsible for coordinating the loading of catalogs from providers into the cache.
 */
export class CatalogLoader {
  constructor(
    private registry: CatalogRegistry,
    private cache: CatalogCache
  ) {}

  /**
   * Loads a specific category entirely from a given provider into the cache.
   * Useful for pre-loading small catalogs.
   */
  public async loadCategory(providerId: string, category: CatalogCategory): Promise<void> {
    const provider = this.registry.getProvider(providerId);
    if (!provider) {
      throw new Error(`Cannot load category: Provider '${providerId}' not found.`);
    }

    // Ensure the provider is initialized
    await provider.initialize();

    const items = await provider.listByCategory(category);
    
    // Store in cache
    this.cache.setCategoryList(category, items);
    
    // Mark as registered in the registry
    this.registry.registerCategory(category);
    
    // Future: Emit CatalogLoaded event here
  }

  /**
   * Initializes all registered providers.
   */
  public async initializeProviders(): Promise<void> {
    const providers = this.registry.getProviders();
    await Promise.all(providers.map(p => p.initialize()));
  }
}
