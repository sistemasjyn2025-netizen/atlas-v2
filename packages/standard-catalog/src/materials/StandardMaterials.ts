import { CatalogItem, CatalogCategory } from '@atlas/catalog-engine';
import { SteelS235, SteelS275, SteelS355, ConcreteC25, ConcreteC30, Aluminum6061, TimberGL24 } from '@atlas/material-engine';

export function createMaterialCatalogItems(): CatalogItem[] {
  const materials = [
    SteelS235, SteelS275, SteelS355, 
    ConcreteC25, ConcreteC30, 
    Aluminum6061, TimberGL24
  ];

  return materials.map(m => ({
    id: m.id,
    code: m.code,
    name: m.name,
    description: m.description || `Standard material ${m.name}`,
    category: CatalogCategory.Material,
    metadata: {
      material: m
    }
  }));
}
