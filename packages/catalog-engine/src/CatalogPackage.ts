import { CatalogItem } from './CatalogItem';

/**
 * Interface for a deployable Catalog Package.
 * A Catalog Package is a self-contained unit of catalog items (e.g. ATLAS Standard, AISC, CIRSOC)
 * that can be loaded into the CatalogEngine without coupling the engine to domain logic.
 */
export interface CatalogPackage {
  /** Unique ID for this package (e.g. 'atlas-standard') */
  readonly id: string;
  
  /** Human readable name (e.g. 'ATLAS Standard Catalog') */
  readonly name: string;
  
  /** Version of the package (e.g. '1.0.0') */
  readonly version: string;
  
  /** Manufacturer or organization providing the catalog */
  readonly manufacturer: string;
  
  /** Source or origin reference */
  readonly source: string;
  
  /** Loads and returns all CatalogItems provided by this package */
  load(): Promise<CatalogItem[]>;
}
