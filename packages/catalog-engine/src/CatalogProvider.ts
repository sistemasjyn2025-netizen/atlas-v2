import { CatalogItem } from './CatalogItem';
import { CatalogCategory } from './types';

/**
 * Abstraction for accessing catalog data from various sources
 * (e.g., Memory, PostgreSQL, REST, ERP, SAP, JSON).
 */
export interface CatalogProvider {
  /** Unique identifier for the provider instance. */
  id: string;

  /**
   * Initializes the provider (e.g., opens connections, loads files).
   */
  initialize(): Promise<void>;

  /**
   * Retrieves an item by its unique ID.
   */
  getById(id: string): Promise<CatalogItem | undefined>;

  /**
   * Retrieves an item by its standard engineering code.
   */
  getByCode(code: string, category?: CatalogCategory): Promise<CatalogItem | undefined>;

  /**
   * Retrieves all items belonging to a specific category.
   */
  listByCategory(category: CatalogCategory): Promise<CatalogItem[]>;

  /**
   * Performs a free-text search or partial match.
   */
  search(query: string): Promise<CatalogItem[]>;
}
