import { InvalidGeometryError } from '../errors/InvalidGeometryError';
import { Millimeters, SectionFamily, ManufacturingMethod } from '../types';
import {
  ISection, CSection, LSection, BoxSection, PipeSection, TSection, 
  ZSection, FlatBarSection, RoundBarSection, ChannelSection
} from '../models';

export class SectionBuilder {
  
  private static validatePositive(value: Millimeters, name: string): void {
    if (value <= 0) {
      throw new InvalidGeometryError(`${name} must be greater than 0. Got: ${value}`);
    }
  }

  private static validateNonNegative(value?: Millimeters, name: string = 'Radius'): void {
    if (value !== undefined && value < 0) {
      throw new InvalidGeometryError(`${name} cannot be negative. Got: ${value}`);
    }
  }

  private static validateThicknesses(h: Millimeters, b: Millimeters, tw: Millimeters, tf?: Millimeters): void {
    if (tw >= b) {
      throw new InvalidGeometryError(`Web thickness (${tw}) cannot be greater than or equal to section width (${b}).`);
    }
    if (tf !== undefined) {
      // Typically 2*tf < h for an I-section, but for a T-section it's 1*tf < h
      // We will do a generic check: a single flange thickness cannot exceed total height
      if (tf >= h) {
        throw new InvalidGeometryError(`Flange thickness (${tf}) cannot be greater than or equal to section height (${h}).`);
      }
    } else {
      // E.g. LSection or Box
      if (tw >= h) {
        throw new InvalidGeometryError(`Thickness (${tw}) cannot be greater than or equal to section height (${h}).`);
      }
    }
  }

  public static buildI(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, tw: Millimeters, tf: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): ISection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(tw, 'Web thickness (tw)');
    this.validatePositive(tf, 'Flange thickness (tf)');
    this.validateNonNegative(r, 'Root radius (r)');
    this.validateThicknesses(h, b, tw, tf);
    
    // For I section specifically, 2 * tf must be < h
    if (2 * tf >= h) {
      throw new InvalidGeometryError(`Sum of flange thicknesses (2 * ${tf} = ${2 * tf}) cannot be greater than or equal to section height (${h}).`);
    }

    return new ISection(id, code, name, family, method, h, b, tw, tf, r, metadata);
  }

  public static buildC(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, tw: Millimeters, tf: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): CSection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(tw, 'Web thickness (tw)');
    this.validatePositive(tf, 'Flange thickness (tf)');
    this.validateNonNegative(r, 'Root radius (r)');
    this.validateThicknesses(h, b, tw, tf);
    
    if (2 * tf >= h) {
      throw new InvalidGeometryError(`Sum of flange thicknesses (2 * ${tf} = ${2 * tf}) cannot be greater than or equal to section height (${h}).`);
    }

    return new CSection(id, code, name, family, method, h, b, tw, tf, r, metadata);
  }

  public static buildChannel(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, tw: Millimeters, tf: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): ChannelSection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(tw, 'Web thickness (tw)');
    this.validatePositive(tf, 'Flange thickness (tf)');
    this.validateNonNegative(r, 'Root radius (r)');
    this.validateThicknesses(h, b, tw, tf);
    
    if (2 * tf >= h) {
      throw new InvalidGeometryError(`Sum of flange thicknesses (2 * ${tf} = ${2 * tf}) cannot be greater than or equal to section height (${h}).`);
    }

    return new ChannelSection(id, code, name, family, method, h, b, tw, tf, r, metadata);
  }

  public static buildL(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, t: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): LSection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(t, 'Thickness (t)');
    this.validateNonNegative(r, 'Root radius (r)');
    this.validateThicknesses(h, b, t);

    return new LSection(id, code, name, family, method, h, b, t, r, metadata);
  }

  public static buildBox(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, t: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): BoxSection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(t, 'Thickness (t)');
    this.validateNonNegative(r, 'Corner radius (r)');
    
    if (2 * t >= h) {
      throw new InvalidGeometryError(`Total vertical thickness (2*${t}) must be less than height (${h}).`);
    }
    if (2 * t >= b) {
      throw new InvalidGeometryError(`Total horizontal thickness (2*${t}) must be less than width (${b}).`);
    }

    return new BoxSection(id, code, name, family, method, h, b, t, r, metadata);
  }

  public static buildPipe(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    d: Millimeters, t: Millimeters, metadata?: Record<string, unknown>
  ): PipeSection {
    this.validatePositive(d, 'Diameter (d)');
    this.validatePositive(t, 'Thickness (t)');
    
    if (2 * t >= d) {
      throw new InvalidGeometryError(`Total thickness (2*${t}) cannot be greater than or equal to diameter (${d}).`);
    }

    return new PipeSection(id, code, name, family, method, d, t, metadata);
  }

  public static buildT(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, tw: Millimeters, tf: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): TSection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(tw, 'Web thickness (tw)');
    this.validatePositive(tf, 'Flange thickness (tf)');
    this.validateNonNegative(r, 'Root radius (r)');
    this.validateThicknesses(h, b, tw, tf);

    return new TSection(id, code, name, family, method, h, b, tw, tf, r, metadata);
  }

  public static buildZ(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    h: Millimeters, b: Millimeters, tw: Millimeters, tf: Millimeters, r?: Millimeters, metadata?: Record<string, unknown>
  ): ZSection {
    this.validatePositive(h, 'Height (h)');
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(tw, 'Web thickness (tw)');
    this.validatePositive(tf, 'Flange thickness (tf)');
    this.validateNonNegative(r, 'Root radius (r)');
    this.validateThicknesses(h, b, tw, tf);

    return new ZSection(id, code, name, family, method, h, b, tw, tf, r, metadata);
  }

  public static buildFlatBar(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    b: Millimeters, t: Millimeters, metadata?: Record<string, unknown>
  ): FlatBarSection {
    this.validatePositive(b, 'Width (b)');
    this.validatePositive(t, 'Thickness (t)');

    return new FlatBarSection(id, code, name, family, method, b, t, metadata);
  }

  public static buildRoundBar(
    id: string, code: string, name: string, family: SectionFamily, method: ManufacturingMethod,
    d: Millimeters, metadata?: Record<string, unknown>
  ): RoundBarSection {
    this.validatePositive(d, 'Diameter (d)');

    return new RoundBarSection(id, code, name, family, method, d, metadata);
  }
}
