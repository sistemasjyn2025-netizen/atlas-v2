import {
  CatalogEngine,
  CatalogRegistry,
  CatalogCache,
  CatalogLoader,
  LocalCatalogProvider,
  CatalogCategory,
  CatalogItem
} from '../src';

describe('CatalogEngine', () => {
  let registry: CatalogRegistry;
  let cache: CatalogCache;
  let loader: CatalogLoader;
  let engine: CatalogEngine;
  let localProvider: LocalCatalogProvider;

  const mockItem1: CatalogItem = {
    id: 'item-1',
    code: 'IPN200',
    name: 'IPN 200 Profile',
    description: 'Standard IPN 200',
    category: CatalogCategory.StructuralProfile,
    metadata: {}
  };

  const mockItem2: CatalogItem = {
    id: 'item-2',
    code: 'A36',
    name: 'A36 Steel',
    description: 'Standard A36 structural steel',
    category: CatalogCategory.Material,
    metadata: {}
  };

  beforeEach(() => {
    registry = new CatalogRegistry();
    cache = new CatalogCache();
    loader = new CatalogLoader(registry, cache);
    engine = new CatalogEngine(registry, cache, loader);

    localProvider = new LocalCatalogProvider([mockItem1, mockItem2]);
    registry.registerProvider(localProvider);
  });

  it('should throw if getting item without setting active provider', async () => {
    expect(await engine.getItemById('item-1')).toBeUndefined();
  });

  it('should fetch item from active provider on cache miss', async () => {
    engine.setActiveProvider(localProvider.id);
    
    // Cache is empty, this is a miss
    expect(cache.getById('item-1')).toBeUndefined();
    
    const item = await engine.getItemById('item-1');
    expect(item).toBeDefined();
    expect(item?.code).toBe('IPN200');
    
    // Now it should be in cache
    expect(cache.getById('item-1')).toBeDefined();
  });

  it('should return item from cache directly (cache hit)', async () => {
    engine.setActiveProvider(localProvider.id);
    
    // Manually put it in cache
    cache.setItem(mockItem1);
    
    // Spy on provider to ensure it's not called
    const spy = jest.spyOn(localProvider, 'getById');
    
    const item = await engine.getItemById('item-1');
    expect(item).toBeDefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should throw when setting non-existent provider as active', () => {
    expect(() => engine.setActiveProvider('missing-provider')).toThrow();
  });

  it('should list and cache categories', async () => {
    engine.setActiveProvider(localProvider.id);
    
    expect(registry.hasCategory(CatalogCategory.Material)).toBe(false);
    
    const items = await engine.listByCategory(CatalogCategory.Material);
    expect(items.length).toBe(1);
    expect(items[0].code).toBe('A36');
    
    // Should now be registered and cached
    expect(registry.hasCategory(CatalogCategory.Material)).toBe(true);
    expect(cache.getCategoryList(CatalogCategory.Material)?.length).toBe(1);
  });

  it('should support manual cache invalidation', async () => {
    engine.setActiveProvider(localProvider.id);
    await engine.getItemById('item-1'); // caches it
    
    expect(cache.getById('item-1')).toBeDefined();
    
    cache.invalidateItem('item-1');
    expect(cache.getById('item-1')).toBeUndefined();
  });

  it('should handle non-existent item correctly', async () => {
    engine.setActiveProvider(localProvider.id);
    const item = await engine.getItemById('does-not-exist');
    expect(item).toBeUndefined();
  });

  it('should allow loading incrementally via loader', async () => {
    // loader.loadCategory fetches entire category into cache
    await loader.loadCategory(localProvider.id, CatalogCategory.StructuralProfile);
    
    expect(registry.hasCategory(CatalogCategory.StructuralProfile)).toBe(true);
    const cachedList = cache.getCategoryList(CatalogCategory.StructuralProfile);
    expect(cachedList?.length).toBe(1);
    
    // Engine will now just return the cached list without provider
    engine.setActiveProvider(localProvider.id); // set just in case, though it won't be used
    const spy = jest.spyOn(localProvider, 'listByCategory');
    const items = await engine.listByCategory(CatalogCategory.StructuralProfile);
    expect(spy).not.toHaveBeenCalled();
    expect(items.length).toBe(1);
  });
  
  it('should allow clearing the whole cache', async () => {
    cache.setItem(mockItem1);
    cache.setItem(mockItem2);
    
    cache.clear();
    
    expect(cache.getById(mockItem1.id)).toBeUndefined();
    expect(cache.getById(mockItem2.id)).toBeUndefined();
  });
});
