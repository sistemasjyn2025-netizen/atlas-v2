import { SectionProperties } from '@atlas/property-engine';
import { MaterialRegistry } from './MaterialRegistry';
import { MaterialCache } from './MaterialCache';
import { Material } from './Material';
import { MaterialCalculatedProperties } from './types';

export class MaterialEngine {
  constructor(
    public readonly registry: MaterialRegistry,
    public readonly cache: MaterialCache
  ) {}

  /**
   * Retrieves a material by its code. Leverages cache for O(1) performance.
   */
  public getMaterial(code: string): Material {
    const cached = this.cache.getByCode(code);
    if (cached) return cached;

    // Search registry if not in cache (though standard flow registers and caches immediately)
    for (const mat of this.registry.list()) {
      if (mat.code === code) {
        this.cache.set(mat);
        return mat;
      }
    }

    throw new Error(`Material with code '${code}' not found in registry.`);
  }

  /**
   * Calculates the mass properties of a section extruded along a specific length.
   * Converts mm² area from Property Engine to SI (m²) for calculations.
   */
  public calculateMass(sectionProps: SectionProperties, material: Material, lengthMeters: number): MaterialCalculatedProperties {
    return this.computeProperties(sectionProps, material, lengthMeters);
  }

  /**
   * Calculates the weight properties (forces) of a section extruded along a specific length.
   */
  public calculateWeight(sectionProps: SectionProperties, material: Material, lengthMeters: number): MaterialCalculatedProperties {
    return this.computeProperties(sectionProps, material, lengthMeters);
  }

  /**
   * Calculates the self-weight (linear weight and mass per meter) of a section.
   */
  public calculateSelfWeight(sectionProps: SectionProperties, material: Material): MaterialCalculatedProperties {
    return this.computeProperties(sectionProps, material, 1.0);
  }

  /**
   * Internal pure calculation kernel ensuring immutability of SectionProperties.
   */
  private computeProperties(sectionProps: SectionProperties, material: Material, length: number): MaterialCalculatedProperties {
    // Area from PropertyEngine is in mm². Convert to m² for SI physics.
    const areaM2 = sectionProps.geometry.area / 1e6;
    const volume = areaM2 * length;
    
    const density = material.physical.density;               // kg/m³
    const specificWeight = material.physical.specificWeight; // N/m³

    const mass = volume * density;
    const weight = volume * specificWeight;

    // Linear properties (per 1 meter)
    const linearMass = areaM2 * 1.0 * density;
    const linearWeight = areaM2 * 1.0 * specificWeight;

    return {
      mass,
      weight,
      selfWeight: weight, // For semantic convenience
      linearMass,
      linearWeight,
      volume,
      materialId: material.id,
      densityUsed: density
    };
  }
}
