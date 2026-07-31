export interface CostRatesProvider {
  getMaterialRate(profile: string): number; // returns price per kg or meter
  getWeightPerMeter(profile: string): number; // kg/m
  getOperationRate(operationType: string): number; // price per operation
}

export class DefaultCostRates implements CostRatesProvider {
  getMaterialRate(profile: string): number {
    // Default 2.5 currency units per kg for steel profiles
    if (profile.startsWith('IPN') || profile.startsWith('UPN') || profile.startsWith('HEA')) {
      return 2.5; 
    }
    // Default 3.0 for sheets
    return 3.0;
  }

  getWeightPerMeter(profile: string): number {
    // Simplified stub. A real engine would query a steel profile database.
    if (profile === 'IPN120') return 11.1;
    if (profile === 'IPN400') return 92.4;
    if (profile === 'UPN200') return 25.3;
    if (profile === 'L50x5') return 3.77;
    return 10.0; // fallback
  }

  getOperationRate(operationType: string): number {
    switch (operationType) {
      case 'cutting': return 5.0; // per cut
      case 'drilling': return 1.5; // per hole
      case 'welding': return 12.0; // per meter or per assembly, simplified here
      case 'painting': return 8.0; // per square meter, simplified here to per item
      default: return 5.0;
    }
  }
}
