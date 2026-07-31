import { CatalogRegistry } from './CatalogRegistry';
import { CatalogCache } from './CatalogCache';
import { CatalogLoader } from './CatalogLoader';
import { CatalogCategory } from './types';
import { CatalogItem } from './CatalogItem';
import { CatalogPackage } from './CatalogPackage';

export class CatalogEngine {
  private activeProviderId: string | null = null;
  private packages: Map<string, CatalogPackage> = new Map();

  constructor(
    public readonly registry: CatalogRegistry,
    public readonly cache: CatalogCache,
    public readonly loader: CatalogLoader
  ) {}

  public setActiveProvider(providerId: string): void {
    if (!this.registry.hasProvider(providerId)) {
      throw new Error(`Cannot set active provider: '${providerId}' is not registered.`);
    }
    this.activeProviderId = providerId;
  }

  public getActiveProviderId(): string | null {
    return this.activeProviderId;
  }

  public registerPackage(pkg: CatalogPackage): void {
    this.packages.set(pkg.id, pkg);
  }

  public async loadPackage(packageId: string): Promise<void> {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new Error(`CatalogPackage '${packageId}' is not registered.`);
    }
    const items = await pkg.load();
    for (const item of items) {
      this.cache.setItem(item);
    }
  }

  public unloadPackage(packageId: string): void {
    this.packages.delete(packageId);
  }

  public listPackages(): CatalogPackage[] {
    return Array.from(this.packages.values());
  }

  public async getItemById(id: string): Promise<CatalogItem | undefined> {
    const cached = this.cache.getById(id);
    if (cached) return cached;

    if (!this.activeProviderId) return undefined;
    const provider = this.registry.getProvider(this.activeProviderId);
    if (!provider) return undefined;

    const item = await provider.getById(id);
    if (item) this.cache.setItem(item);
    return item;
  }

  public async getItemByCode(code: string, category?: CatalogCategory): Promise<CatalogItem | undefined> {
    const cached = this.cache.getByCode(code, category);
    if (cached) return cached;

    if (!this.activeProviderId) return undefined;
    const provider = this.registry.getProvider(this.activeProviderId);
    if (!provider) return undefined;

    const item = await provider.getByCode(code, category);
    if (item) this.cache.setItem(item);
    return item;
  }

  public async listByCategory(category: CatalogCategory): Promise<CatalogItem[]> {
    if (this.registry.hasCategory(category)) {
      const cachedList = this.cache.getCategoryList(category);
      if (cachedList) return cachedList;
    }

    if (!this.activeProviderId) return [];
    const provider = this.registry.getProvider(this.activeProviderId);
    if (!provider) return [];

    const items = await provider.listByCategory(category);
    this.cache.setCategoryList(category, items);
    this.registry.registerCategory(category);
    return items;
  }
}
