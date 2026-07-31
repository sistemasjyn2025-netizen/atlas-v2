import { BoxSection } from '@atlas/section-engine';
import { PropertyCalculator } from './PropertyCalculator';
import { SectionProperties } from '../types';
import { InvalidDimensionsError } from '../errors';

export class BoxSectionCalculator implements PropertyCalculator<BoxSection> {
  public readonly type = 'Analytical';

  public calculate(section: BoxSection): SectionProperties {
    const { h, b, t } = section;

    if (h <= 0 || b <= 0 || t <= 0) {
      throw new InvalidDimensionsError('Dimensions must be positive for BoxSection.');
    }

    // Idealized (ignoring corner radius r)
    const hi = h - 2 * t; // Inner height
    const bi = b - 2 * t; // Inner width

    const area = (h * b) - (hi * bi);
    const areaSI = area / 1e6;
    const perimeter = 2 * (h + b) + 2 * (hi + bi); // outer + inner (if needed for painting, standard practice)
    
    const cx = b / 2;
    const cy = h / 2;

    const ix = (b * Math.pow(h, 3) - bi * Math.pow(hi, 3)) / 12;
    const iy = (h * Math.pow(b, 3) - hi * Math.pow(bi, 3)) / 12;
    const ixy = 0;

    // Torsional Constant (J) - Bredt's formula for closed thin-walled sections
    // Am = enclosed area by midline
    const am = (b - t) * (h - t);
    const perimeterMid = 2 * ((b - t) + (h - t));
    const j = (4 * Math.pow(am, 2) * t) / perimeterMid;

    const wx = ix / cy;
    const wy = iy / cx;

    const zx = (b * Math.pow(h, 2) - bi * Math.pow(hi, 2)) / 4;
    const zy = (h * Math.pow(b, 2) - hi * Math.pow(bi, 2)) / 4;

    const rx = Math.sqrt(ix / area);
    const ry = Math.sqrt(iy / area);

    return {
      geometry: { area, areaSI, perimeter, centroid: { cx, cy }, boundingBox: { width: b, height: h } },
      inertia: { ix, iy, ixy, j },
      resistance: { wx, wy, zx, zy },
      stability: { rx, ry }
    };
  }
}
