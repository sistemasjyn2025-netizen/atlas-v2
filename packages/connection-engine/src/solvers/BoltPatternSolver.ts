import { IBoltGroup } from '../domain/ConnectionDTOs';

export class BoltPatternSolver {
  /**
   * Genera un patrón rectangular de agujeros/tornillos dados los márgenes al borde.
   */
  public static generateRectangularPattern(
    width: number, 
    height: number, 
    edgeDist: number, 
    rows: number, 
    cols: number
  ): IBoltGroup {
    const coords = [];
    const spanX = width - (edgeDist * 2);
    const spanY = height - (edgeDist * 2);
    const pitchX = cols > 1 ? spanX / (cols - 1) : 0;
    const pitchY = rows > 1 ? spanY / (rows - 1) : 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -width/2 + edgeDist + (c * pitchX);
        const y = -height/2 + edgeDist + (r * pitchY);
        // Las coordenadas son relativas al centro geométrico de la placa, Z=0
        coords.push({ x, y, z: 0 }); 
      }
    }
    
    return {
      id: 'bolt_group_rect_' + Math.random().toString(36).substr(2, 9),
      boltStandard: 'ISO 4014 M20',
      diameter: 20,       // Render visual 20mm
      holeDiameter: 22,   // Perforación CNC 22mm
      localCoordinates: coords,
      // Matriz Identidad por defecto, el ensamblador la multiplicará por la pos global
      globalTransform: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) 
    };
  }

  /**
   * Genera un patrón al tresbolillo (staggered) para conexiones de momento o uniones complejas.
   */
  public static generateStaggeredPattern(
    width: number,
    height: number,
    edgeDist: number,
    pairs: number
  ): IBoltGroup {
    const coords = [];
    // Simplificación de tresbolillo a modo ilustrativo
    const spanY = height - (edgeDist * 2);
    const pitchY = pairs > 1 ? spanY / (pairs - 1) : 0;

    for (let p = 0; p < pairs; p++) {
      const y = -height/2 + edgeDist + (p * pitchY);
      const offsetX = p % 2 === 0 ? 0 : 20; // tresbolillo de 20mm
      
      coords.push({ x: -width/2 + edgeDist + offsetX, y, z: 0 });
      coords.push({ x: width/2 - edgeDist - offsetX, y, z: 0 });
    }

    return {
      id: 'bolt_group_staggered_' + Math.random().toString(36).substr(2, 9),
      boltStandard: 'ISO 4014 M20',
      diameter: 20,
      holeDiameter: 22,
      localCoordinates: coords,
      globalTransform: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
    };
  }
}
