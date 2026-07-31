import { Material } from '../Material';
import { MaterialFamily, MaterialCategory, PhysicalProperties, MechanicalProperties, ThermalProperties } from '../types';

export class TimberMaterial extends Material {
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
    // Timber is typically Orthotropic
    super(id, code, name, MaterialFamily.Timber, MaterialCategory.Orthotropic, description, physical, mechanical, thermal, metadata);
  }
}
