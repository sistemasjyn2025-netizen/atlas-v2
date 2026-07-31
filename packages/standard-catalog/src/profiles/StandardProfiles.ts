import { CatalogItem, CatalogCategory } from '@atlas/catalog-engine';
import { SectionBuilder, SectionFamily, ManufacturingMethod } from '@atlas/section-engine';
import { PropertyEngine, CalculatorRegistry, PropertyCache, ISectionCalculator, BoxSectionCalculator, PipeSectionCalculator } from '@atlas/property-engine';
import { UnitsEngine, LengthUnits } from '@atlas/units-engine';

export function createProfileCatalogItems(): CatalogItem[] {
  const unitsEngine = new UnitsEngine();
  
  const propertyEngine = new PropertyEngine(new CalculatorRegistry(), new PropertyCache());
  propertyEngine.registry.register('I' as any, new ISectionCalculator());
  propertyEngine.registry.register('Box' as any, new BoxSectionCalculator());
  propertyEngine.registry.register('Pipe' as any, new PipeSectionCalculator());

  const items: CatalogItem[] = [];

  // 1. Generate IPE profiles (I-Sections)
  const ipeData = [
    { h: 80, b: 46, tw: 3.8, tf: 5.2 },
    { h: 100, b: 55, tw: 4.1, tf: 5.7 },
    { h: 120, b: 64, tw: 4.4, tf: 6.3 },
    { h: 140, b: 73, tw: 4.7, tf: 6.9 },
    { h: 160, b: 82, tw: 5.0, tf: 7.4 },
    { h: 180, b: 91, tw: 5.3, tf: 8.0 },
    { h: 200, b: 100, tw: 5.6, tf: 8.5 },
    { h: 220, b: 110, tw: 5.9, tf: 9.2 },
    { h: 240, b: 120, tw: 6.2, tf: 9.8 },
    { h: 270, b: 135, tw: 6.6, tf: 10.2 },
    { h: 300, b: 150, tw: 7.1, tf: 10.7 },
    { h: 330, b: 160, tw: 7.5, tf: 11.5 },
    { h: 360, b: 170, tw: 8.0, tf: 12.7 },
    { h: 400, b: 180, tw: 8.6, tf: 13.5 },
    { h: 450, b: 190, tw: 9.4, tf: 14.6 }
  ];

  for (const data of ipeData) {
    const code = `IPE${data.h}`;
    const section = SectionBuilder.buildI(
      code, code, code,
      SectionFamily.European, ManufacturingMethod.HotRolled,
      data.h, data.b, data.tw, data.tf
    );
    const props = propertyEngine.calculate(section);

    items.push({
      id: `prof-${code.toLowerCase()}`,
      code: code,
      name: code,
      description: `European I beam ${code}`,
      category: CatalogCategory.StructuralProfile,
      metadata: {
        section,
        properties: props,
        dimensions: {
          h: unitsEngine.build(data.h, LengthUnits.Millimeter),
          b: unitsEngine.build(data.b, LengthUnits.Millimeter),
          tw: unitsEngine.build(data.tw, LengthUnits.Millimeter),
          tf: unitsEngine.build(data.tf, LengthUnits.Millimeter)
        }
      }
    });
  }

  // 2. Generate HEA profiles (I-Sections)
  const heaData = [
    { h: 96, b: 100, tw: 5.0, tf: 8.0, code: 'HEA100' },
    { h: 114, b: 120, tw: 5.0, tf: 8.0, code: 'HEA120' },
    { h: 133, b: 140, tw: 5.5, tf: 8.5, code: 'HEA140' },
    { h: 152, b: 160, tw: 6.0, tf: 9.0, code: 'HEA160' },
    { h: 171, b: 180, tw: 6.0, tf: 9.5, code: 'HEA180' },
    { h: 190, b: 200, tw: 6.5, tf: 10.0, code: 'HEA200' },
    { h: 210, b: 220, tw: 7.0, tf: 11.0, code: 'HEA220' },
    { h: 230, b: 240, tw: 7.5, tf: 12.0, code: 'HEA240' },
    { h: 250, b: 260, tw: 7.5, tf: 12.5, code: 'HEA260' },
    { h: 270, b: 280, tw: 8.0, tf: 13.0, code: 'HEA280' },
  ];

  for (const data of heaData) {
    const section = SectionBuilder.buildI(
      data.code, data.code, data.code,
      SectionFamily.European, ManufacturingMethod.HotRolled,
      data.h, data.b, data.tw, data.tf
    );
    const props = propertyEngine.calculate(section);

    items.push({
      id: `prof-${data.code.toLowerCase()}`,
      code: data.code,
      name: data.code,
      description: `European wide flange ${data.code}`,
      category: CatalogCategory.StructuralProfile,
      metadata: {
        section,
        properties: props,
        dimensions: {
          h: unitsEngine.build(data.h, LengthUnits.Millimeter),
          b: unitsEngine.build(data.b, LengthUnits.Millimeter),
          tw: unitsEngine.build(data.tw, LengthUnits.Millimeter),
          tf: unitsEngine.build(data.tf, LengthUnits.Millimeter)
        }
      }
    });
  }

  // 3. Generate HEB profiles
  const hebData = [
    { h: 100, b: 100, tw: 6.0, tf: 10.0, code: 'HEB100' },
    { h: 120, b: 120, tw: 6.5, tf: 11.0, code: 'HEB120' },
    { h: 140, b: 140, tw: 7.0, tf: 12.0, code: 'HEB140' },
    { h: 160, b: 160, tw: 8.0, tf: 13.0, code: 'HEB160' },
    { h: 180, b: 180, tw: 8.5, tf: 14.0, code: 'HEB180' },
    { h: 200, b: 200, tw: 9.0, tf: 15.0, code: 'HEB200' },
    { h: 220, b: 220, tw: 9.5, tf: 16.0, code: 'HEB220' },
    { h: 240, b: 240, tw: 10.0, tf: 17.0, code: 'HEB240' },
    { h: 260, b: 260, tw: 10.0, tf: 17.5, code: 'HEB260' },
    { h: 280, b: 280, tw: 10.5, tf: 18.0, code: 'HEB280' },
  ];

  for (const data of hebData) {
    const section = SectionBuilder.buildI(
      data.code, data.code, data.code,
      SectionFamily.European, ManufacturingMethod.HotRolled,
      data.h, data.b, data.tw, data.tf
    );
    const props = propertyEngine.calculate(section);

    items.push({
      id: `prof-${data.code.toLowerCase()}`,
      code: data.code,
      name: data.code,
      description: `European heavy wide flange ${data.code}`,
      category: CatalogCategory.StructuralProfile,
      metadata: {
        section,
        properties: props,
        dimensions: {
          h: unitsEngine.build(data.h, LengthUnits.Millimeter),
          b: unitsEngine.build(data.b, LengthUnits.Millimeter),
          tw: unitsEngine.build(data.tw, LengthUnits.Millimeter),
          tf: unitsEngine.build(data.tf, LengthUnits.Millimeter)
        }
      }
    });
  }

  // 4. Generate SHS
  const shsData = [
    { b: 50, tw: 3, code: 'SHS50x50x3' },
    { b: 60, tw: 4, code: 'SHS60x60x4' },
    { b: 80, tw: 5, code: 'SHS80x80x5' },
    { b: 100, tw: 6, code: 'SHS100x100x6' },
    { b: 120, tw: 8, code: 'SHS120x120x8' }
  ];

  for (const data of shsData) {
    const section = SectionBuilder.buildBox(
      data.code, data.code, data.code,
      SectionFamily.European, ManufacturingMethod.ColdFormed,
      data.b, data.b, data.tw, data.tw
    );
    const props = propertyEngine.calculate(section);
    
    items.push({
      id: `prof-${data.code.toLowerCase()}`,
      code: data.code,
      name: data.code,
      description: `Square Hollow Section ${data.code}`,
      category: CatalogCategory.StructuralProfile,
      metadata: {
        section,
        properties: props,
        dimensions: {
          h: unitsEngine.build(data.b, LengthUnits.Millimeter),
          b: unitsEngine.build(data.b, LengthUnits.Millimeter),
          tw: unitsEngine.build(data.tw, LengthUnits.Millimeter),
          tf: unitsEngine.build(data.tw, LengthUnits.Millimeter)
        }
      }
    });
  }
  
  // 5. Generate CHS (Pipe)
  const pipeData = [
    { d: 48.3, t: 3.2, code: 'CHS48.3x3.2' },
    { d: 60.3, t: 3.2, code: 'CHS60.3x3.2' },
    { d: 76.1, t: 3.2, code: 'CHS76.1x3.2' },
    { d: 88.9, t: 4.0, code: 'CHS88.9x4.0' },
    { d: 114.3, t: 5.0, code: 'CHS114.3x5.0' }
  ];

  for (const data of pipeData) {
    const section = SectionBuilder.buildPipe(
      data.code, data.code, data.code,
      SectionFamily.European, ManufacturingMethod.ColdFormed,
      data.d, data.t
    );
    const props = propertyEngine.calculate(section);
    
    items.push({
      id: `prof-${data.code.toLowerCase()}`,
      code: data.code,
      name: data.code,
      description: `Circular Hollow Section ${data.code}`,
      category: CatalogCategory.StructuralProfile,
      metadata: {
        section,
        properties: props,
        dimensions: {
          d: unitsEngine.build(data.d, LengthUnits.Millimeter),
          t: unitsEngine.build(data.t, LengthUnits.Millimeter)
        }
      }
    });
  }

  return items;
}
