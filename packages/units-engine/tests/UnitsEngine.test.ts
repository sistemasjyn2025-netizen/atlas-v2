import { UnitsEngine } from '../src/UnitsEngine';
import { UnitFamily } from '../src/types';
import { LengthUnits } from '../src/units/LengthUnits';
import { MassUnits } from '../src/units/MassUnits';
import { ForceUnits } from '../src/units/ForceUnits';
import { TemperatureUnits } from '../src/units/TemperatureUnits';
import { IncompatibleUnitsError } from '../src/errors';

describe('UnitsEngine', () => {
  let engine: UnitsEngine;

  beforeEach(() => {
    engine = new UnitsEngine();
    
    // Register bases
    engine.getRegistry().registerBaseUnit(UnitFamily.Length, LengthUnits.Meter);
    engine.getRegistry().registerBaseUnit(UnitFamily.Mass, MassUnits.Kilogram);
    engine.getRegistry().registerBaseUnit(UnitFamily.Force, ForceUnits.Newton);
    engine.getRegistry().registerBaseUnit(UnitFamily.Temperature, TemperatureUnits.Kelvin);

    // Register Multipliers (to Base)
    // 1 mm = 0.001 m
    engine.getRegistry().registerUnit(LengthUnits.Millimeter, 0.001);
    // 1 cm = 0.01 m
    engine.getRegistry().registerUnit(LengthUnits.Centimeter, 0.01);
    // 1 km = 1000 m
    engine.getRegistry().registerUnit(LengthUnits.Kilometer, 1000);
    // 1 in = 0.0254 m
    engine.getRegistry().registerUnit(LengthUnits.Inch, 0.0254);
    // 1 ft = 0.3048 m
    engine.getRegistry().registerUnit(LengthUnits.Foot, 0.3048);

    // 1 g = 0.001 kg
    engine.getRegistry().registerUnit(MassUnits.Gram, 0.001);
    // 1 ton = 1000 kg
    engine.getRegistry().registerUnit(MassUnits.Ton, 1000);

    // 1 kN = 1000 N
    engine.getRegistry().registerUnit(ForceUnits.Kilonewton, 1000);

    // 1 C = 1 K - 273.15. So 1°C = 1K with offset 273.15
    engine.getRegistry().registerUnit(TemperatureUnits.Celsius, 1.0, 273.15);
  });

  it('converts correctly between SI units', () => {
    const q = engine.build(1000, LengthUnits.Millimeter);
    const converted = engine.convert(q, LengthUnits.Meter);
    expect(converted.value).toBeCloseTo(1.0);
    expect(converted.unit.symbol).toBe('m');
  });

  it('converts correctly from SI to Imperial', () => {
    const q = engine.build(1, LengthUnits.Inch);
    const converted = engine.convert(q, LengthUnits.Millimeter);
    expect(converted.value).toBeCloseTo(25.4);
  });

  it('throws when converting incompatible units', () => {
    const q = engine.build(1, LengthUnits.Meter);
    expect(() => {
      engine.convert(q, MassUnits.Kilogram as any);
    }).toThrow(IncompatibleUnitsError);
  });

  it('adds two quantities of same unit', () => {
    const q1 = engine.build(1000, LengthUnits.Millimeter);
    const q2 = engine.build(2, LengthUnits.Meter); // 2000 mm

    const result = engine.add(q1, q2);
    expect(result.value).toBeCloseTo(3000);
    expect(result.unit.symbol).toBe('mm');
  });

  it('multiplies by scalar', () => {
    const q1 = engine.build(10, LengthUnits.Meter);
    const result = engine.multiplyByScalar(q1, 2.5);
    expect(result.value).toBe(25);
    expect(result.unit.symbol).toBe('m');
  });

  it('compares correctly', () => {
    const q1 = engine.build(1000, LengthUnits.Millimeter);
    const q2 = engine.build(1, LengthUnits.Meter);
    const q3 = engine.build(1.1, LengthUnits.Meter);

    expect(engine.equals(q1, q2)).toBe(true);
    expect(engine.compare(q3, q1)).toBe(1);
    expect(engine.compare(q1, q3)).toBe(-1);
  });

  it('formats quantity correctly', () => {
    const q = engine.build(1234.5678, LengthUnits.Millimeter);
    // In node test env, Intl formatting for grouping might be "1,234.568 mm"
    const str = engine.format(q, { decimals: 2 });
    expect(str).toContain('1,234.57 mm'); // Depending on locale string
  });
  
  it('converts back and forth (m -> mm -> m) cumulatively', () => {
    const q1 = engine.build(1, LengthUnits.Meter);
    const q2 = engine.convert(q1, LengthUnits.Millimeter);
    const q3 = engine.convert(q2, LengthUnits.Meter);
    
    expect(q3.value).toBeCloseTo(1);
    expect(q3.unit.symbol).toBe('m');
  });
  
  it('handles temperature offsets', () => {
    // 0 C = 273.15 K
    const qC = engine.build(0, TemperatureUnits.Celsius);
    const qK = engine.convert(qC, TemperatureUnits.Kelvin);
    expect(qK.value).toBeCloseTo(273.15);
    
    // 300 K = 26.85 C
    const qK2 = engine.build(300, TemperatureUnits.Kelvin);
    const qC2 = engine.convert(qK2, TemperatureUnits.Celsius);
    expect(qC2.value).toBeCloseTo(26.85);
  });
});
