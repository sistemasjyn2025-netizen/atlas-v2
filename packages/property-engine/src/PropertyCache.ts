import { StructuralSection } from '@atlas/section-engine';
import { SectionProperties } from './types';

export class PropertyCache {
  private cache: Map<string, SectionProperties> = new Map();

  /**
   * Generates a unique hash for a section based on its geometric dimensions.
   */
  public generateHash(section: StructuralSection): string {
    const data = section.toJSON();
    // We only care about the shape and the raw dimensions.
    // The name, code, material, or metadata do not affect geometric properties.
    const hashObject = {
      shape: data.shape,
      dimensions: data.dimensions
    };
    
    // Sort keys to ensure deterministic hashing
    const dimKeys = Object.keys(hashObject.dimensions).sort();
    const sortedDims = dimKeys.map(k => `${k}:${hashObject.dimensions[k]}`).join('|');
    
    return `${hashObject.shape}::${sortedDims}`;
  }

  public get(section: StructuralSection): SectionProperties | undefined {
    const hash = this.generateHash(section);
    return this.cache.get(hash);
  }

  public set(section: StructuralSection, properties: SectionProperties): void {
    const hash = this.generateHash(section);
    this.cache.set(hash, properties);
  }

  public clear(): void {
    this.cache.clear();
  }
}
