import {
  SectionBuilder,
  InvalidGeometryError,
  SectionFamily,
  ManufacturingMethod,
  ISection,
  PipeSection,
  SectionShape,
  StructuralSection
} from '../src';

describe('SectionEngine', () => {
  describe('Builder Logic & Validations', () => {
    it('should build a valid ISection', () => {
      const section = SectionBuilder.buildI(
        'ipe200', 'IPE200', 'IPE 200',
        SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5, 12
      );

      expect(section).toBeInstanceOf(ISection);
      expect(section.h).toBe(200);
      expect(section.b).toBe(100);
      expect(section.tw).toBe(5.6);
      expect(section.tf).toBe(8.5);
      expect(section.r).toBe(12);
      expect(section.shape).toBe(SectionShape.I);
    });

    it('should build a valid ISection without radius', () => {
      const section = SectionBuilder.buildI(
        'welded-i', 'W-I', 'Welded I',
        SectionFamily.Custom, ManufacturingMethod.Welded,
        200, 100, 5, 8
      );

      expect(section.r).toBeUndefined();
    });

    it('should throw InvalidGeometryError on negative height', () => {
      expect(() => {
        SectionBuilder.buildI(
          'ipe200', 'IPE200', 'IPE 200',
          SectionFamily.European, ManufacturingMethod.HotRolled,
          -200, 100, 5.6, 8.5
        );
      }).toThrow(InvalidGeometryError);
    });

    it('should throw InvalidGeometryError if web thickness is greater than width', () => {
      expect(() => {
        SectionBuilder.buildI(
          'bad', 'BAD', 'Bad I',
          SectionFamily.European, ManufacturingMethod.HotRolled,
          200, 10, 20, 8.5 // tw (20) > b (10)
        );
      }).toThrow(InvalidGeometryError);
    });

    it('should throw InvalidGeometryError if total flange thickness exceeds height in ISection', () => {
      expect(() => {
        SectionBuilder.buildI(
          'bad', 'BAD', 'Bad I',
          SectionFamily.European, ManufacturingMethod.HotRolled,
          100, 100, 5, 60 // 2 * 60 = 120 > 100
        );
      }).toThrow(InvalidGeometryError);
    });
    
    it('should build a valid PipeSection', () => {
      const pipe = SectionBuilder.buildPipe(
        'pipe', 'PIPE', 'Pipe 100x5',
        SectionFamily.American, ManufacturingMethod.ColdFormed,
        100, 5
      );
      
      expect(pipe).toBeInstanceOf(PipeSection);
      expect(pipe.d).toBe(100);
      expect(pipe.t).toBe(5);
    });
    
    it('should throw if pipe thickness exceeds diameter', () => {
      expect(() => {
        SectionBuilder.buildPipe(
          'pipe', 'PIPE', 'Pipe 10x10',
          SectionFamily.American, ManufacturingMethod.ColdFormed,
          10, 10
        );
      }).toThrow(InvalidGeometryError);
    });
  });

  describe('Polymorphism and Equality', () => {
    it('should compare two equal sections correctly', () => {
      const sec1 = SectionBuilder.buildI(
        '1', 'IPE200', 'IPE', SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5, 12
      );
      const sec2 = SectionBuilder.buildI(
        '2', 'IPE200', 'IPE', SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5, 12
      );

      expect(sec1.equals(sec2)).toBe(true);
    });

    it('should identify different sections by dimensions', () => {
      const sec1 = SectionBuilder.buildI(
        '1', 'IPE200', 'IPE', SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5, 12
      );
      const sec2 = SectionBuilder.buildI(
        '2', 'IPE220', 'IPE', SectionFamily.European, ManufacturingMethod.HotRolled,
        220, 110, 5.9, 9.2, 12
      );

      expect(sec1.equals(sec2)).toBe(false);
    });

    it('should identify different shapes', () => {
      const sec1 = SectionBuilder.buildL(
        '1', 'L', 'L', SectionFamily.European, ManufacturingMethod.HotRolled,
        100, 100, 10
      );
      const sec2 = SectionBuilder.buildBox(
        '2', 'Box', 'Box', SectionFamily.European, ManufacturingMethod.HotRolled,
        100, 100, 10
      );
      
      // We typecast to StructuralSection to test polymorphic equality
      expect((sec1 as StructuralSection).equals(sec2 as StructuralSection)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize metadata and dimensions correctly', () => {
      const sec = SectionBuilder.buildI(
        '1', 'IPE200', 'IPE 200', SectionFamily.European, ManufacturingMethod.HotRolled,
        200, 100, 5.6, 8.5, 12, { manufacturer: 'Acme' }
      );

      const json = sec.toJSON();
      expect(json.id).toBe('1');
      expect(json.metadata.manufacturer).toBe('Acme');
      expect(json.dimensions.h).toBe(200);
      expect(json.dimensions.b).toBe(100);
      expect(json.dimensions.r).toBe(12);
    });
  });
});
