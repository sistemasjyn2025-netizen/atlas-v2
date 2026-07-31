import { EntityManager } from '@atlas/kernel';
import { TopologyDetector } from './TopologyDetector';
import { RuleEvaluator } from './RuleEvaluator';
import { ConstraintSolver } from './ConstraintSolver';
import { GeometryGenerator } from './GeometryGenerator';
import { StandardPack } from './packs/standard/StandardPack';
import { BasePlateSolver } from './solvers/BasePlateSolver';
import { ApexSolver } from './solvers/ApexSolver';
import { IConnectionSolver } from './solvers/IConnectionSolver';
import { IConnectionDetail, INodeTopology } from './domain/ConnectionDTOs';

export class ConnectionEngine {
  private topologyDetector = new TopologyDetector();
  private ruleEvaluator = new RuleEvaluator();
  private constraintSolver = new ConstraintSolver();
  private geometryGenerator = new GeometryGenerator();
  
  private solvers: IConnectionSolver[] = [
    new BasePlateSolver(),
    new ApexSolver()
  ];

  constructor() {
    this.ruleEvaluator.registerPack(new StandardPack());
  }

  public execute(entityManager: EntityManager, projectId: string, abortSignal?: AbortSignal): IConnectionDetail[] {
    const checkAbort = () => {
      if (abortSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
    };
    
    const graph = entityManager.getGraph();
    const topologies = this.topologyDetector.detect(graph, projectId);
    const resolvedConnections: IConnectionDetail[] = [];

    for (const topology of topologies) {
      checkAbort(); 
      
      // Adaptador temporal: mapeo de la topología vieja a la nueva INodeTopology
      const anyTop = topology as any;
      const mappedTopology: INodeTopology = {
        nodeId: anyTop.id || Math.random().toString(),
        isSupportNode: anyTop.type === 'BasePlate',
        members: anyTop.members?.map((m: any) => ({
          id: m.id,
          profile: { width: 200, height: 400 }, // Mock
          role: m.role || (anyTop.type === 'BasePlate' ? 'column' : 'beam'),
          direction: m.direction || { x: 0, y: 1, z: 0 }
        })) || []
      };

      // Nuevo Pipeline LOD 400
      for (const solver of this.solvers) {
        if (solver.canResolve(mappedTopology)) {
          const detail = solver.resolve(mappedTopology);
          resolvedConnections.push(detail);
          break; // Conexión resuelta
        }
      }

      // Fallback a LOD 300 (Viejo pipeline)
      const ruleResult = this.ruleEvaluator.evaluate(topology);
      if (ruleResult) {
        const specification = this.constraintSolver.solve(topology, ruleResult);
        this.geometryGenerator.generate(entityManager, topology, specification);
      }
    }
    
    return resolvedConnections;
  }
}
