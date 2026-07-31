import { ISection } from '@atlas/section-engine';
import { PropertyCalculator } from './PropertyCalculator';
import { SectionProperties } from '../types';
import { InvalidDimensionsError } from '../errors';

export class ISectionCalculator implements PropertyCalculator<ISection> {
  public readonly type = 'Analytical';

  public calculate(section: ISection): SectionProperties {
    const { h, b, tw, tf } = section;

    if (h <= 0 || b <= 0 || tw <= 0 || tf <= 0) {
      throw new InvalidDimensionsError('Dimensions must be positive for ISection.');
    }

    // Idealized (ignoring root radius r)
    const hw = h - 2 * tf; // web height
    
    // Geometry
    const area = 2 * (b * tf) + (hw * tw);
    const areaSI = area / 1e6;
    const perimeter = 4 * b + 2 * h - 2 * tw;
    const cx = b / 2;
    const cy = h / 2;

    // Inertia
    const ix = (b * Math.pow(h, 3) - (b - tw) * Math.pow(hw, 3)) / 12;
    const iy = (2 * tf * Math.pow(b, 3) + hw * Math.pow(tw, 3)) / 12;
    const ixy = 0; // Doubly symmetric

    // Torsional Constant (J) - Approximation for open thin-walled sections
    const j = (2 * b * Math.pow(tf, 3) + hw * Math.pow(tw, 3)) / 3;

    // Resistance
    const wx = ix / cy;
    const wy = iy / cx;

    // Plastic Modulus (idealized)
    const zx = (tw * Math.pow(hw, 2)) / 4 + b * tf * (h - tf);
    const zy = (2 * tf * Math.pow(b, 2)) / 4 + (hw * Math.pow(tw, 2)) / 4;

    // Stability
    const rx = Math.sqrt(ix / area);
    const ry = Math.sqrt(iy / area);

    return {
      geometry: {
        area,
        areaSI,
        perimeter,
        centroid: { cx, cy },
        boundingBox: { width: b, height: h }
      },
      inertia: {
        ix, iy, ixy, j
      },
      resistance: {
        wx, wy, zx, zy
      },
      stability: {
        rx, ry
      }
    };
  }
}
