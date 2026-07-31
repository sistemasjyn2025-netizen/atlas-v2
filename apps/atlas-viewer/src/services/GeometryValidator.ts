export class GeometryValidator {
  public static sanitize(input: any): any {
    if (!input) return input;
    const sanitized = { ...input };

    // 1. Límites Absolutos
    if (sanitized.width !== undefined) {
      sanitized.width = Math.max(5000, Math.min(sanitized.width, 40000));
    }
    if (sanitized.length !== undefined) {
      sanitized.length = Math.max(10000, Math.min(sanitized.length, 100000));
    }
    
    // 2. Límites Relativos (Evitar "Rascacielos" y vuelcos)
    // La altura NO puede superar el ancho del galpón
    if (sanitized.height !== undefined && sanitized.width !== undefined) {
      const maxHeight = sanitized.width * 1.0; 
      sanitized.height = Math.max(3000, Math.min(sanitized.height, maxHeight));
    }

    // 3. Rango de Pendiente de Cubierta (Mínimo para lluvia, máximo estructural)
    if (sanitized.roofSlope !== undefined) {
      sanitized.roofSlope = Math.max(0.05, Math.min(sanitized.roofSlope, 0.35));
    }
    
    // 4. Separación entre pórticos
    if (sanitized.baySpacing !== undefined) {
      sanitized.baySpacing = Math.max(3000, Math.min(sanitized.baySpacing, 8000));
    }

    return sanitized;
  }
}
