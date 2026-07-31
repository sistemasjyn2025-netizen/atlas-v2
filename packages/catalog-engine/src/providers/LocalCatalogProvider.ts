import { CatalogProvider } from '../CatalogProvider';
import { CatalogItem } from '../CatalogItem';
import { CatalogCategory } from '../types';

/**
 * An in-memory implementation of the CatalogProvider.
 * Intended for V1 infrastructure and tests, loading items directly from an array.
 */
export class LocalCatalogProvider implements CatalogProvider {
  public id = 'local-catalog-provider';
  private items: Map<string, CatalogItem> = new Map();
  
  constructor(initialData: CatalogItem[] = []) {
    for (const item of initialData) {
      this.items.set(item.id, item);
    }
  }

  public async initialize(): Promise<void> {
    // Local provider is already initialized
    return Promise.resolve();
  }

  public async getById(id: string): Promise<CatalogItem | undefined> {
    return this.items.get(id);
  }

  public async getByCode(code: string, category?: CatalogCategory): Promise<CatalogItem | undefined> {
    for (const item of this.items.values()) {
      if (item.code === code) {
        if (category && item.category !== category) {
          continue;
        }
        return item;
      }
    }
    return undefined;
  }

  public async listByCategory(category: CatalogCategory): Promise<CatalogItem[]> {
    const result: CatalogItem[] = [];
    for (const item of this.items.values()) {
      if (item.category === category) {
        result.push(item);
      }
    }
    return result;
  }

  public async search(query: string): Promise<CatalogItem[]> {
    const lowerQuery = query.toLowerCase();
    const result: CatalogItem[] = [];
    for (const item of this.items.values()) {
      if (
        item.name.toLowerCase().includes(lowerQuery) ||
        item.code.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      ) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Helper to seed data dynamically during tests or initial load.
   */
  public seed(items: CatalogItem[]): void {
    for (const item of items) {
      this.items.set(item.id, item);
    }
  }
}
