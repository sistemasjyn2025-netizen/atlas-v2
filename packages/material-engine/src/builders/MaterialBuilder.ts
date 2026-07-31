import { PhysicalProperties, MechanicalProperties, ThermalProperties } from '../types';
import { SteelMaterial, ConcreteMaterial, AluminumMaterial, TimberMaterial } from '../materials';

export class MaterialBuilder {
  private static validate(physical: PhysicalProperties, mechanical: MechanicalProperties): void {
    if (physical.density <= 0) {
      throw new Error(`Density must be greater than 0. Got: ${physical.density}`);
    }
    if (mechanical.youngModulus <= 0) {
      throw new Error(`Young Modulus must be greater than 0. Got: ${mechanical.youngModulus}`);
    }
    if (mechanical.yieldStrength > mechanical.ultimateStrength) {
      throw new Error(`Yield strength (${mechanical.yieldStrength}) cannot be greater than Ultimate strength (${mechanical.ultimateStrength}).`);
    }
    if (mechanical.poisson < 0 || mechanical.poisson > 0.5) {
      throw new Error(`Poisson's ratio must be between 0.0 and 0.5. Got: ${mechanical.poisson}`);
    }
  }

  public static buildSteel(
    id: string, code: string, name: string, description: string,
    physical: PhysicalProperties, mechanical: MechanicalProperties, thermal: ThermalProperties
  ): SteelMaterial {
    this.validate(physical, mechanical);
    return new SteelMaterial(id, code, name, description, physical, mechanical, thermal);
  }

  public static buildConcrete(
    id: string, code: string, name: string, description: string,
    physical: PhysicalProperties, mechanical: MechanicalProperties, thermal: ThermalProperties
  ): ConcreteMaterial {
    this.validate(physical, mechanical);
    return new ConcreteMaterial(id, code, name, description, physical, mechanical, thermal);
  }

  public static buildAluminum(
    id: string, code: string, name: string, description: string,
    physical: PhysicalProperties, mechanical: MechanicalProperties, thermal: ThermalProperties
  ): AluminumMaterial {
    this.validate(physical, mechanical);
    return new AluminumMaterial(id, code, name, description, physical, mechanical, thermal);
  }

  public static buildTimber(
    id: string, code: string, name: string, description: string,
    physical: PhysicalProperties, mechanical: MechanicalProperties, thermal: ThermalProperties
  ): TimberMaterial {
    this.validate(physical, mechanical);
    return new TimberMaterial(id, code, name, description, physical, mechanical, thermal);
  }
}
