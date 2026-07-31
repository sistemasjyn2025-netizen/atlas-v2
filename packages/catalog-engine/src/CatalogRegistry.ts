import { CatalogProvider } from './CatalogProvider';
import { CatalogCategory } from './types';

/**
 * Manages active providers and keeps track of which categories are registered
 * (useful for partial catalog loads).
 */
export class CatalogRegistry {
  private providers: Map<string, CatalogProvider> = new Map();
  private registeredCategories: Set<CatalogCategory> = new Set();
  
  // Future: support multiple catalogs/sub-catalogs (e.g., "AISC 15th", "CIRSOC 301")
  // For V1 infrastructure, we register which categories are "active" in the current engine scope.

  /**
   * Registers a data provider.
   */
  public registerProvider(provider: CatalogProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Unregisters a provider by its ID.
   */
  public unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }

  /**
   * Retrieves a specific provider by ID.
   */
  public getProvider(providerId: string): CatalogProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Checks if a provider exists.
   */
  public hasProvider(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  /**
   * Lists all registered providers.
   */
  public getProviders(): CatalogProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Registers that a specific category catalog (e.g. Structural Profiles) is available.
   */
  public registerCategory(category: CatalogCategory): void {
    this.registeredCategories.add(category);
  }

  /**
   * Unregisters a category catalog.
   */
  public unregisterCategory(category: CatalogCategory): void {
    this.registeredCategories.delete(category);
  }

  /**
   * Checks if a category catalog is registered.
   */
  public hasCategory(category: CatalogCategory): boolean {
    return this.registeredCategories.has(category);
  }

  /**
   * Lists all registered catalog categories.
   */
  public categories(): CatalogCategory[] {
    return Array.from(this.registeredCategories.values());
  }
}
