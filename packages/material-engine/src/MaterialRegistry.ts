import { Material } from './Material';

export class MaterialRegistry {
  private materials: Map<string, Material> = new Map();

  public register(material: Material): void {
    this.materials.set(material.id, material);
  }

  public unregister(materialId: string): void {
    this.materials.delete(materialId);
  }

  public get(materialId: string): Material | undefined {
    return this.materials.get(materialId);
  }

  public exists(materialId: string): boolean {
    return this.materials.has(materialId);
  }

  public list(): Material[] {
    return Array.from(this.materials.values());
  }
}
