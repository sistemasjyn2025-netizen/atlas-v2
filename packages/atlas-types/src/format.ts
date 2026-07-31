import { EntityGraph } from './domain';

/**
 * Metadata for the .atlas format
 */
export interface AtlasFormatMetadata {
  formatVersion: string;
  atlasVersion: string;
}

/**
 * The serialized structure of a .atlas file
 */
export interface AtlasDocument {
  metadata: AtlasFormatMetadata;
  graph: EntityGraph;
  parameters: Record<string, any>;
}
