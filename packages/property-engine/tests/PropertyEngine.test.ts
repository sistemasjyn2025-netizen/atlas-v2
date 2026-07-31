import { SectionBuilder, SectionFamily, ManufacturingMethod, SectionShape } from '@atlas/section-engine';
import {
  PropertyEngine,
  CalculatorRegistry,
  PropertyCache,
  ISectionCalculator,
  BoxSectionCalculator,
  PipeSectionCalculator,
  CalculatorNotFoundError,
  InvalidDimensionsError
} from '../src';

describe('PropertyEngine', () => {
  let registry: CalculatorRegistry;
  let cache: PropertyCache;
  let engine: PropertyEngine;

  beforeEach(() => {
    registry = new CalculatorRegistry();
    registry.register(SectionShape.I, new ISectionCalculator());
    registry.register(SectionShape.Box, new BoxSectionCalculator());
    registry.register(SectionShape.Pipe, new PipeSectionCalculator());
    
    cache = new PropertyCache();
    engine = new PropertyEngine(registry, cache);
  });

  describe('ISection Calculation (Idealized)', () => {
    it('should calculate properties correctly for a valid ISection', () => {
      // Idealized IPE 200 (approximate): h=200, b=100, tw=5.6, tf=8.5 (ignoring r=12)
      const ipe200 = SectionBuilder.buildI(
        'ipe200', 'IPE200', 'IPE 200',
        SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5, 12
      );

      const props = engine.calculate(ipe200);

      expect(props.geometry.area).toBeGreaterThan(0);
      expect(props.geometry.areaSI).toBe(props.geometry.area / 1e6);
      expect(props.geometry.centroid.cx).toBe(50); // 100/2
      expect(props.geometry.centroid.cy).toBe(100); // 200/2
      
      expect(props.inertia.ix).toBeGreaterThan(0);
      expect(props.inertia.iy).toBeGreaterThan(0);
      expect(props.resistance.wx).toBeGreaterThan(0);
      expect(props.stability.rx).toBeGreaterThan(0);
    });
  });

  describe('BoxSection Calculation', () => {
    it('should calculate properties for BoxSection', () => {
      const box = SectionBuilder.buildBox(
        'box100', 'BOX', 'Box', SectionFamily.Custom, ManufacturingMethod.ColdFormed,
        100, 100, 5
      );
      const props = engine.calculate(box);
      expect(props.geometry.area).toBe(100*100 - 90*90); // 10000 - 8100 = 1900
      expect(props.geometry.centroid.cx).toBe(50);
      expect(props.geometry.centroid.cy).toBe(50);
      expect(props.inertia.ix).toBe(props.inertia.iy); // symmetric square
    });
  });

  describe('Cache Behavior', () => {
    it('should hit cache on subsequent identical calls', () => {
      const ipe200 = SectionBuilder.buildI(
        'ipe200', 'IPE200', 'IPE 200',
        SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5
      );

      // We spy on the calculator to see if calculate is called again
      const calculator = registry.get(SectionShape.I)!;
      const spy = jest.spyOn(calculator, 'calculate');

      const props1 = engine.calculate(ipe200);
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call should hit cache
      const props2 = engine.calculate(ipe200);
      expect(spy).toHaveBeenCalledTimes(1);
      
      expect(props1).toBe(props2); // Exact same object reference from cache
    });

    it('should calculate again if dimensions change', () => {
      const sec1 = SectionBuilder.buildI(
        '1', '1', '1', SectionFamily.Custom, ManufacturingMethod.Welded,
        200, 100, 5, 5
      );
      const sec2 = SectionBuilder.buildI(
        '2', '2', '2', SectionFamily.Custom, ManufacturingMethod.Welded,
        220, 100, 5, 5
      ); // height changed

      const calculator = registry.get(SectionShape.I)!;
      const spy = jest.spyOn(calculator, 'calculate');

      engine.calculate(sec1);
      expect(spy).toHaveBeenCalledTimes(1);
      
      engine.calculate(sec2);
      expect(spy).toHaveBeenCalledTimes(2); // Misses cache because geometry is different
    });
  });

  describe('Error Handling', () => {
    it('should throw CalculatorNotFoundError for unregistered shapes', () => {
      const custom = SectionBuilder.buildL(
        'L', 'L', 'L', SectionFamily.Custom, ManufacturingMethod.HotRolled,
        100, 100, 10
      );
      // We didn't register an LSection calculator in this test file
      expect(() => engine.calculate(custom)).toThrow(CalculatorNotFoundError);
    });

    it('should propagate InvalidDimensionsError if calculator throws it', () => {
      // Force an invalid state that passes builder but fails calculator (impossible normally, but let's mock it)
      const pipe = SectionBuilder.buildPipe(
        'pipe', 'PIPE', 'Pipe', SectionFamily.Custom, ManufacturingMethod.Welded,
        100, 5
      );
      // Manually mutate to test calc validation (in TS we have to bypass readonly)
      (pipe as any).d = -10;

      expect(() => engine.calculate(pipe)).toThrow(InvalidDimensionsError);
    });
  });
});
