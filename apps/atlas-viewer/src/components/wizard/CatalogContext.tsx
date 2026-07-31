import React, { createContext, useContext, useEffect, useState } from 'react';
import { CatalogEngine, CatalogRegistry, CatalogCache, CatalogLoader } from '@atlas/catalog-engine';
import { StandardCatalogPackage } from '@atlas/standard-catalog';

interface CatalogContextState {
  engine: CatalogEngine | null;
  loading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogContextState>({
  engine: null,
  loading: true,
  error: null,
});

export const useCatalog = () => useContext(CatalogContext);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CatalogContextState>({
    engine: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function initCatalog() {
      try {
        const registry = new CatalogRegistry();
        const cache = new CatalogCache();
        const loader = new CatalogLoader(registry, cache);
        const engine = new CatalogEngine(registry, cache, loader);
        
        const pkg = new StandardCatalogPackage();
        engine.registerPackage(pkg);
        await engine.loadPackage(pkg.id);
        
        setState({ engine, loading: false, error: null });
      } catch (err: any) {
        setState({ engine: null, loading: false, error: err.message });
      }
    }
    
    initCatalog();
  }, []);

  return (
    <CatalogContext.Provider value={state}>
      {children}
    </CatalogContext.Provider>
  );
};
