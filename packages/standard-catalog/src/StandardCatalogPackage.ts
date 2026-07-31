import { CatalogPackage, CatalogItem } from '@atlas/catalog-engine';
import { createMaterialCatalogItems } from './materials/StandardMaterials';
import { createProfileCatalogItems } from './profiles/StandardProfiles';

export class StandardCatalogPackage implements CatalogPackage {
  public readonly id = 'atlas-standard';
  public readonly name = 'ATLAS Standard Catalog';
  public readonly version = '1.0.0';
  public readonly manufacturer = 'ATLAS Systems';
  public readonly source = 'ATLAS Built-in Content';

  public async load(): Promise<CatalogItem[]> {
    const materials = createMaterialCatalogItems();
    const profiles = createProfileCatalogItems();
    return [...materials, ...profiles];
  }
}
