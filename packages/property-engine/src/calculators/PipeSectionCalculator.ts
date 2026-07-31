import { PipeSection } from '@atlas/section-engine';
import { PropertyCalculator } from './PropertyCalculator';
import { SectionProperties } from '../types';
import { InvalidDimensionsError } from '../errors';

export class PipeSectionCalculator implements PropertyCalculator<PipeSection> {
  public readonly type = 'Analytical';

  public calculate(section: PipeSection): SectionProperties {
    const { d, t } = section;

    if (d <= 0 || t <= 0) {
      throw new InvalidDimensionsError('Dimensions must be positive for PipeSection.');
    }

    const di = d - 2 * t; // Inner diameter
    
    // Geometry
    const area = (Math.PI / 4) * (Math.pow(d, 2) - Math.pow(di, 2));
    const areaSI = area / 1e6;
    const perimeter = Math.PI * (d + di);
    const cx = d / 2;
    const cy = d / 2;

    // Inertia
    const ix = (Math.PI / 64) * (Math.pow(d, 4) - Math.pow(di, 4));
    const iy = ix; // symmetric
    const ixy = 0;
    const j = 2 * ix; // Torsional constant for circular section

    // Resistance
    const wx = ix / cy;
    const wy = wx;
    
    const zx = (Math.pow(d, 3) - Math.pow(di, 3)) / 6;
    const zy = zx;

    // Stability
    const rx = Math.sqrt(ix / area);
    const ry = rx;

    return {
      geometry: { area, areaSI, perimeter, centroid: { cx, cy }, boundingBox: { width: d, height: d } },
      inertia: { ix, iy, ixy, j },
      resistance: { wx, wy, zx, zy },
      stability: { rx, ry }
    };
  }
}
