/**
 * Base interface for catalog item metadata.
 * Kept generic for this milestone, but architecture is prepared for specialization.
 */
export interface CatalogMetadata extends Record<string, unknown> {}

/**
 * Specialized metadata for structural profiles (Prepared for future use).
 */
export interface StructuralProfileMetadata extends CatalogMetadata {
  // e.g. massPerMeter?: number;
  // e.g. sectionArea?: number;
}

/**
 * Specialized metadata for materials (Prepared for future use).
 */
export interface MaterialMetadata extends CatalogMetadata {
  // e.g. yieldStrength?: number;
  // e.g. ultimateStrength?: number;
}

/**
 * Specialized metadata for bolts (Prepared for future use).
 */
export interface BoltMetadata extends CatalogMetadata {
  // e.g. diameter?: number;
  // e.g. grade?: string;
}

/**
 * Specialized metadata for plates (Prepared for future use).
 */
export interface PlateMetadata extends CatalogMetadata {
  // e.g. thickness?: number;
}
