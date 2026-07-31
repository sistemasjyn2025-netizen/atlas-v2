/**
 * Represents the origin or authority defining the catalog entries.
 */
export interface CatalogSource {
  /** e.g., 'CIRSOC', 'AISC' */
  organization: string;

  /** e.g., '301', 'Specification for Structural Steel Buildings' */
  standard: string;

  /** e.g., '2005', '15th' */
  edition: string;

  /** e.g., 'Argentina', 'USA' */
  country: string;

  /** e.g., 2005, 2016 */
  publicationYear: number;
}
