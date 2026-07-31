import { CatalogEngine, CatalogRegistry, CatalogCache, CatalogLoader, CatalogCategory } from '@atlas/catalog-engine';
import { StandardCatalogPackage } from '../src/StandardCatalogPackage';

describe('StandardCatalogPackage', () => {
  let engine: CatalogEngine;
  let pkg: StandardCatalogPackage;

  beforeEach(() => {
    const registry = new CatalogRegistry();
    const cache = new CatalogCache();
    const loader = new CatalogLoader(registry, cache);
    engine = new CatalogEngine(registry, cache, loader);
    pkg = new StandardCatalogPackage();
    engine.registerPackage(pkg);
  });

  it('registers and lists packages', () => {
    const packages = engine.listPackages();
    expect(packages.length).toBe(1);
    expect(packages[0].id).toBe('atlas-standard');
  });

  it('loads materials correctly', async () => {
    await engine.loadPackage('atlas-standard');
    
    const steel = engine.cache.getByCode('S355', CatalogCategory.Material);
    expect(steel).toBeDefined();
    
    const meta = steel?.metadata as any;
    expect(meta.material).toBeDefined();
    expect(meta.material.code).toBe('S355');
  });

  it('loads profiles correctly with geometric properties', async () => {
    await engine.loadPackage('atlas-standard');
    
    const ipe200 = engine.cache.getByCode('IPE200', CatalogCategory.StructuralProfile);
    expect(ipe200).toBeDefined();
    
    const meta = ipe200?.metadata as any;
    expect(meta.section).toBeDefined();
    expect(meta.properties).toBeDefined();
    expect(meta.dimensions).toBeDefined();

    const area = meta.properties.geometry.area;
    expect(area).toBeGreaterThan(0);
    
    const h = meta.dimensions.h.value;
    expect(h).toBe(200);
  });

  it('does not produce duplicate IDs', async () => {
    const items = await pkg.load();
    const ids = new Set<string>();
    
    for (const item of items) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
    }
  });
});
