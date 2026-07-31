import { Transform, Point3D } from '../src/primitives';

describe('Spatial Primitives', () => {
  it('should define a transform with correct origin', () => {
    const origin: Point3D = { x: 0, y: 0, z: 0 };
    const transform: Transform = {
      position: origin,
      rotation: { x: 0, y: 0, z: 0 }
    };
    
    expect(transform.position.x).toBe(0);
    expect(transform.position.y).toBe(0);
    expect(transform.position.z).toBe(0);
  });
});
