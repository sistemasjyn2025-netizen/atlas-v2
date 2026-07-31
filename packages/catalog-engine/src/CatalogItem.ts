import { CatalogCategory } from './types';
import { CatalogMetadata } from './CatalogMetadata';

/**
 * Base interface for any technical element within the ATLAS Catalog Engine.
 */
export interface CatalogItem {
  /** Unique internal identifier. */
  id: string;

  /** Standard engineering code (e.g., 'IPN200', 'A36'). */
  code: string;

  /** Human-readable name. */
  name: string;

  /** Brief description. */
  description: string;

  /** Strictly typed category of the item. */
  category: CatalogCategory;

  /** Associated metadata (e.g., dimensions, strength). */
  metadata: CatalogMetadata;
}
