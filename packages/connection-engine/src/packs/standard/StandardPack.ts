import { RulePack, PartialConnectionSpec } from '../../RuleEvaluator';
import { ConnectionTopology } from '../../TopologyDetector';

export class StandardPack implements RulePack {
  name = 'ATLAS-Standard';

  evaluate(topology: ConnectionTopology): PartialConnectionSpec | null {
    if (topology.type === 'BasePlate') {
      return {
        rulePack: this.name,
        ruleId: 'BP-01',
        steelGrade: 'A36',
        plateDimensions: [
          { thickness: 25, width: 400, length: 400 }
        ],
        boltLayout: { type: 'AnchorBolt', count: 4, layoutGrid: '2x2' },
        boltGrade: 'F1554-36',
        holeDiameter: 22,
        pitch: 250,
        gauge: 250,
        edgeDistance: 75,
        weldSpecification: '8mm Fillet'
      };
    }
    
    // Fallback or unknown
    return null;
  }
}
