import { CatalogItem } from './CatalogItem';
import { CatalogCategory } from './types';

/**
 * In-memory cache for the Catalog Engine to prevent repeated lookups to the Provider.
 * Implements deterministic manual invalidation (no TTL).
 */
export class CatalogCache {
  // Keyed by CatalogItem.id
  private itemsById: Map<string, CatalogItem> = new Map();
  
  // Keyed by CatalogItem.code + (optional category)
  private itemsByCode: Map<string, CatalogItem> = new Map();
  
  // Keyed by Category (stores list of items)
  private categoryLists: Map<CatalogCategory, CatalogItem[]> = new Map();

  /**
   * Retrieves an item by its ID.
   */
  public getById(id: string): CatalogItem | undefined {
    return this.itemsById.get(id);
  }

  /**
   * Retrieves an item by its code (and optional category).
   */
  public getByCode(code: string, category?: CatalogCategory): CatalogItem | undefined {
    const key = category ? `${category}::${code}` : code;
    return this.itemsByCode.get(key);
  }

  /**
   * Retrieves the full list of items for a category if cached.
   */
  public getCategoryList(category: CatalogCategory): CatalogItem[] | undefined {
    return this.categoryLists.get(category);
  }

  /**
   * Stores a single item in the cache.
   */
  public setItem(item: CatalogItem): void {
    this.itemsById.set(item.id, item);
    
    // Store by generic code
    this.itemsByCode.set(item.code, item);
    // Store by specific category code
    this.itemsByCode.set(`${item.category}::${item.code}`, item);

    // Invalidate the category list since it's now stale
    this.categoryLists.delete(item.category);
  }

  /**
   * Stores a full list of items for a category in the cache.
   */
  public setCategoryList(category: CatalogCategory, items: CatalogItem[]): void {
    this.categoryLists.set(category, items);
    for (const item of items) {
      this.setItem(item); // Note: this will repeatedly delete the category list, so we set it back below
    }
    this.categoryLists.set(category, items);
  }

  /**
   * Manually invalidates a specific item from the cache.
   */
  public invalidateItem(id: string): void {
    const item = this.itemsById.get(id);
    if (item) {
      this.itemsById.delete(id);
      this.itemsByCode.delete(item.code);
      this.itemsByCode.delete(`${item.category}::${item.code}`);
      this.categoryLists.delete(item.category);
    }
  }

  /**
   * Manually invalidates an entire category from the cache.
   */
  public invalidateCategory(category: CatalogCategory): void {
    this.categoryLists.delete(category);
    
    // Remove all items belonging to this category
    for (const [id, item] of this.itemsById.entries()) {
      if (item.category === category) {
        this.itemsById.delete(id);
        this.itemsByCode.delete(item.code);
        this.itemsByCode.delete(`${item.category}::${item.code}`);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.itemsById.clear();
    this.itemsByCode.clear();
    this.categoryLists.clear();
  }
}
