import { Material } from '../Material';
import { MaterialFamily, MaterialCategory, PhysicalProperties, MechanicalProperties, ThermalProperties } from '../types';

export class ConcreteMaterial extends Material {
  constructor(
    id: string,
    code: string,
    name: string,
    description: string,
    physical: PhysicalProperties,
    mechanical: MechanicalProperties,
    thermal: ThermalProperties,
    metadata?: Record<string, unknown>
  ) {
    super(id, code, name, MaterialFamily.Concrete, MaterialCategory.Isotropic, description, physical, mechanical, thermal, metadata);
  }
}
