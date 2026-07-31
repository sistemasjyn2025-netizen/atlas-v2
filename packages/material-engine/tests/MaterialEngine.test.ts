import {
  MaterialEngine,
  MaterialRegistry,
  MaterialCache,
  StandardMaterials,
  SteelS235,
  ConcreteC25,
  MaterialBuilder
} from '../src';

// We mock a SectionProperties from property-engine since we don't need to actually calculate it here.
// We just need the area in mm².
const mockSectionProps: any = {
  geometry: {
    area: 10000, // 10,000 mm² = 0.01 m²
    perimeter: 400
  }
};

describe('MaterialEngine', () => {
  let registry: MaterialRegistry;
  let cache: MaterialCache;
  let engine: MaterialEngine;

  beforeEach(() => {
    registry = new MaterialRegistry();
    cache = new MaterialCache();
    engine = new MaterialEngine(registry, cache);

    // Register standards
    StandardMaterials.forEach(m => registry.register(m));
  });

  describe('Builder Validations', () => {
    it('should reject negative density', () => {
      expect(() => {
        MaterialBuilder.buildSteel(
          'bad', 'BAD', 'Bad', 'Bad',
          { density: -100, specificWeight: 1000, thermalExpansion: 1 },
          { youngModulus: 2e11, shearModulus: 8e10, poisson: 0.3, yieldStrength: 2e8, ultimateStrength: 4e8 },
          { conductivity: 50, specificHeat: 450 }
        );
      }).toThrow('Density must be greater than 0');
    });

    it('should reject yield strength > ultimate strength', () => {
      expect(() => {
        MaterialBuilder.buildSteel(
          'bad', 'BAD', 'Bad', 'Bad',
          { density: 7850, specificWeight: 78500, thermalExpansion: 1 },
          { youngModulus: 2e11, shearModulus: 8e10, poisson: 0.3, yieldStrength: 5e8, ultimateStrength: 4e8 }, // fy > fu
          { conductivity: 50, specificHeat: 450 }
        );
      }).toThrow('cannot be greater than Ultimate strength');
    });

    it('should reject invalid Poisson ratio', () => {
      expect(() => {
        MaterialBuilder.buildSteel(
          'bad', 'BAD', 'Bad', 'Bad',
          { density: 7850, specificWeight: 78500, thermalExpansion: 1 },
          { youngModulus: 2e11, shearModulus: 8e10, poisson: 0.6, yieldStrength: 2e8, ultimateStrength: 4e8 },
          { conductivity: 50, specificHeat: 450 }
        );
      }).toThrow('Poisson\'s ratio must be between 0.0 and 0.5');
    });
  });

  describe('Registry & Cache', () => {
    it('should retrieve registered material and cache it on first get', () => {
      expect(cache.getByCode('S235')).toBeUndefined();
      
      const mat = engine.getMaterial('S235');
      
      expect(mat).toBeDefined();
      expect(mat.code).toBe('S235');
      
      // Should now be cached
      expect(cache.getByCode('S235')).toBe(mat);
    });

    it('should throw if material not in registry', () => {
      expect(() => engine.getMaterial('UNKNOWN_CODE')).toThrow('not found in registry');
    });
  });

  describe('Physics Calculations', () => {
    it('should accurately calculate linear mass and weight (self weight) in SI', () => {
      // SteelS235 density = 7850 kg/m³, specificWeight = 7850 * 9.80665 ≈ 76982 N/m³
      // mock section area = 10,000 mm² = 0.01 m²
      // Linear mass = 0.01 m² * 7850 kg/m³ = 78.5 kg/m
      
      const result = engine.calculateSelfWeight(mockSectionProps, SteelS235);
      
      expect(result.linearMass).toBeCloseTo(78.5, 3);
      expect(result.mass).toBeCloseTo(78.5, 3); // Since self-weight implies 1m length
      expect(result.linearWeight).toBeCloseTo(78.5 * 9.80665, 3);
      expect(result.volume).toBeCloseTo(0.01, 5); // 0.01 m³ for 1m length
      expect(result.materialId).toBe(SteelS235.id);
    });

    it('should calculate mass and weight for a specific length', () => {
      // 5 meters length
      const result = engine.calculateMass(mockSectionProps, ConcreteC25, 5.0);
      
      // ConcreteC25 density = 2500 kg/m³
      // Area = 0.01 m²
      // Volume = 0.01 * 5 = 0.05 m³
      // Mass = 0.05 * 2500 = 125 kg
      
      expect(result.volume).toBeCloseTo(0.05, 5);
      expect(result.mass).toBeCloseTo(125, 3);
      expect(result.weight).toBeCloseTo(125 * 9.80665, 3);
    });
  });
});
