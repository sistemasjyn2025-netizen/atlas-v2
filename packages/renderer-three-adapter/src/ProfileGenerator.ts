import * as THREE from 'three';

export class ProfileGenerator {
  static createIBeamGeometry(h: number, b: number, tw: number, tf: number, length: number): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const hw = tw / 2;
    const hh = h / 2;
    const hb = b / 2;

    shape.moveTo(-hb, hh);
    shape.lineTo(hb, hh);
    shape.lineTo(hb, hh - tf);
    shape.lineTo(hw, hh - tf);
    shape.lineTo(hw, -hh + tf);
    shape.lineTo(hb, -hh + tf);
    shape.lineTo(hb, -hh);
    shape.lineTo(-hb, -hh);
    shape.lineTo(-hb, -hh + tf);
    shape.lineTo(-hw, -hh + tf);
    shape.lineTo(-hw, hh - tf);
    shape.lineTo(-hb, hh - tf);
    shape.lineTo(-hb, hh);

    const extrudeSettings = { depth: length, bevelEnabled: false, steps: 1 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Extrude geometry goes from Z=0 to Z=length. Center it along Z to match standard BoxGeometry behavior
    geometry.translate(0, 0, -length / 2);
    // Add orientation fixing so the web goes along Z and flanges are top/bottom on Y
    return geometry;
  }

  static createCChannelGeometry(h: number, b: number, t: number, lip: number, length: number): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const hh = h / 2;
    // Assume origin at the center of the web bounding box
    const leftX = -b/2;
    const rightX = b/2;

    shape.moveTo(leftX, hh);
    shape.lineTo(rightX, hh);
    shape.lineTo(rightX, hh - lip);
    shape.lineTo(rightX - t, hh - lip);
    shape.lineTo(rightX - t, hh - t);
    shape.lineTo(leftX + t, hh - t);
    shape.lineTo(leftX + t, -hh + t);
    shape.lineTo(rightX - t, -hh + t);
    shape.lineTo(rightX - t, -hh + lip);
    shape.lineTo(rightX, -hh + lip);
    shape.lineTo(rightX, -hh);
    shape.lineTo(leftX, -hh);
    shape.lineTo(leftX, hh);

    const extrudeSettings = { depth: length, bevelEnabled: false, steps: 1 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -length / 2);
    return geometry;
  }

  static createBoxGeometry(w: number, h: number, t: number, length: number): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const hw = w / 2;
    const hh = h / 2;
    
    // Outer
    shape.moveTo(-hw, hh);
    shape.lineTo(hw, hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(-hw, -hh);
    shape.lineTo(-hw, hh);

    // Inner hole
    const hole = new THREE.Path();
    hole.moveTo(-hw + t, hh - t);
    hole.lineTo(-hw + t, -hh + t);
    hole.lineTo(hw - t, -hh + t);
    hole.lineTo(hw - t, hh - t);
    hole.lineTo(-hw + t, hh - t);
    shape.holes.push(hole);

    const extrudeSettings = { depth: length, bevelEnabled: false, steps: 1 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -length / 2);
    return geometry;
  }

  static parseAndCreateProfile(profile: string, length: number): THREE.BufferGeometry {
    if (profile.startsWith('IPN200')) return this.createIBeamGeometry(200, 90, 7.5, 11.3, length);
    if (profile.startsWith('IPN160')) return this.createIBeamGeometry(160, 74, 6.3, 9.5, length);
    
    if (profile.startsWith('IPE')) {
      return this.createIBeamGeometry(200, 100, 6, 9, length);
    }
    if (profile.startsWith('HEA') || profile.startsWith('HEB')) {
      return this.createIBeamGeometry(200, 200, 8, 12, length);
    }
    if (profile.startsWith('C100x50x15x2')) {
      return this.createCChannelGeometry(100, 50, 2, 15, length);
    }
    if (profile.startsWith('Tube_100x100x3') || profile.startsWith('SHS100x100x')) {
      return this.createBoxGeometry(100, 100, 3, length);
    }
    
    // Fallback I-Beam
    return this.createIBeamGeometry(200, 100, 5, 8, length);
  }
}
