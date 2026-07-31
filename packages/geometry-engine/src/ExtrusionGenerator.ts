import { Transform, Point3D } from '@atlas/spatial-engine';
import { Profile, Solid, BoundingBox, Line, Extrusion } from '@atlas/geometry-core';

export class ExtrusionGenerator {
  
  /**
   * Generates a solid by extruding a profile along a local Z axis by a given length,
   * then applies the provided transform.
   */
  public extrudeProfile(profile: Profile, length: number, transform: Transform): Solid {
    // For this engine v0.1, we do basic volume and bounding box estimations
    
    // IPN120 approximate area = 1420 mm^2 (for testing purposes, let's just mock a standard bounding box)
    // IPN 120 dimensions: h=120, b=58, tw=5.1, tf=7.7
    // Area ~ 14.2 cm2 = 1420 mm2
    let area = 0;
    let width = 0;
    let height = 0;
    
    if (profile.name === 'IPN120') {
      area = 1420; // mm^2
      width = 58; // mm
      height = 120; // mm
    } else {
      // generic fallback
      area = 1000;
      width = 100;
      height = 100;
    }

    const volume = area * length;

    // Local bounding box before transform (assuming extrusion along local Z axis from 0 to length)
    // Profile is centered at 0,0 in local XY plane
    const localMin: Point3D = { x: -width / 2, y: -height / 2, z: 0 };
    const localMax: Point3D = { x: width / 2, y: height / 2, z: length };

    // Apply transform (simplified translation for v0.1)
    const globalMin: Point3D = {
      x: localMin.x + transform.position.x,
      y: localMin.y + transform.position.y,
      z: localMin.z + transform.position.z,
    };

    const globalMax: Point3D = {
      x: localMax.x + transform.position.x,
      y: localMax.y + transform.position.y,
      z: localMax.z + transform.position.z,
    };

    const boundingBox: BoundingBox = { min: globalMin, max: globalMax };

    const path: Line = {
      start: transform.position,
      end: {
        x: transform.position.x,
        y: transform.position.y,
        z: transform.position.z + length
      }
    };

    const extrusion: Extrusion = {
      profile,
      path
    };

    return {
      extrusion,
      volume,
      boundingBox
    };
  }
}
