import { ExtrusionGenerator } from '../src/ExtrusionGenerator';
import { Profile, Line } from '@atlas/geometry-core';
import { Transform } from '@atlas/spatial-engine';

describe('ExtrusionGenerator', () => {
  it('should extrude an IPN120 column correctly', () => {
    const generator = new ExtrusionGenerator();

    const profile: Profile = {
      name: 'IPN120',
      section: {
        outerCurve: { points: [], isClosed: true } // Mock curve
      }
    };

    const length = 7000; // 7000mm
    const transform: Transform = {
      position: { x: 1000, y: 2000, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };

    const solid = generator.extrudeProfile(profile, length, transform);

    // Verify dimensions & volume
    expect(solid).toBeDefined();
    expect(solid.volume).toBe(1420 * 7000); // area * length

    // Verify bounding box (Global)
    // localMin = { x: -29, y: -60, z: 0 }
    // globalMin = localMin + pos = { 971, 1940, 0 }
    expect(solid.boundingBox.min.x).toBe(971);
    expect(solid.boundingBox.min.y).toBe(1940);
    expect(solid.boundingBox.min.z).toBe(0);

    // localMax = { x: 29, y: 60, z: 7000 }
    // globalMax = localMax + pos = { 1029, 2060, 7000 }
    expect(solid.boundingBox.max.x).toBe(1029);
    expect(solid.boundingBox.max.y).toBe(2060);
    expect(solid.boundingBox.max.z).toBe(7000);

    // Verify transform on path
    const path = solid.extrusion?.path as Line;
    expect(path.start.x).toBe(1000);
    expect(path.start.y).toBe(2000);
    expect(path.start.z).toBe(0);
  });
});
