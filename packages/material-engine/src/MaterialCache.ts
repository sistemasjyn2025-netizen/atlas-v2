import { Material } from './Material';

export class MaterialCache {
  private byId: Map<string, Material> = new Map();
  private byCode: Map<string, Material> = new Map();

  public set(material: Material): void {
    this.byId.set(material.id, material);
    this.byCode.set(material.code, material);
  }

  public getById(id: string): Material | undefined {
    return this.byId.get(id);
  }

  public getByCode(code: string): Material | undefined {
    return this.byCode.get(code);
  }

  public invalidate(materialId: string): void {
    const material = this.byId.get(materialId);
    if (material) {
      this.byId.delete(material.id);
      this.byCode.delete(material.code);
    }
  }

  public clear(): void {
    this.byId.clear();
    this.byCode.clear();
  }
}
