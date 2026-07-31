import { ConnectionTopology } from './TopologyDetector';

export interface RulePack {
  name: string;
  evaluate(topology: ConnectionTopology): PartialConnectionSpec | null;
}

export interface PartialConnectionSpec {
  rulePack: string;
  ruleId: string;
  steelGrade: string;
  plateDimensions: { thickness: number; width: number; length: number }[];
  boltLayout: { type: string, count: number, layoutGrid?: string };
  boltGrade: string;
  holeDiameter: number;
  pitch: number;
  gauge: number;
  edgeDistance: number;
  weldSpecification: string;
}

export class RuleEvaluator {
  private packs: RulePack[] = [];

  public registerPack(pack: RulePack) {
    this.packs.push(pack);
  }

  public evaluate(topology: ConnectionTopology): PartialConnectionSpec | null {
    // Attempt evaluation with all registered packs. Returns the first valid one.
    for (const pack of this.packs) {
      const result = pack.evaluate(topology);
      if (result) return result;
    }
    return null;
  }
}
