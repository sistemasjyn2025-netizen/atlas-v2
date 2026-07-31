import { EntityManager } from '@atlas/kernel';
import { IndustrialBuildingBlueprint } from '@atlas/parametric-engine';
import { PartExtractor, BOMGenerator } from '@atlas/manufacturing-engine';
import { ConnectionEngine } from '@atlas/connection-engine';
import { ManufacturingPartSheetGenerator, AssemblyDrawingGenerator } from '@atlas/document-engine';
import { CostEstimator, DefaultCostRates } from '@atlas/cost-engine';
import { AtlasProjectFile, PipelineResult } from './types';
import { PipelineEventEmitter } from './PipelineEvents';

export class ExecutionContext {
  constructor(public entityManager: EntityManager) {}
}

export class AtlasPipeline extends PipelineEventEmitter {
  private async yield() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  public async execute(projectFile: AtlasProjectFile, abortSignal?: AbortSignal): Promise<PipelineResult> {
    const checkAbort = () => {
      if (abortSignal?.aborted) {
        throw new Error('Pipeline Execution Cancelled');
      }
    };

    try {
      this.emit('pipeline:start', undefined);
      
      const entityManager = new EntityManager();
      const context = new ExecutionContext(entityManager);
      
      this.emit('pipeline:progress', { stage: 'Initialization', progress: 10, message: 'Initializing EntityManager...' });
      await this.yield();
      checkAbort();

      const projectName = projectFile.metadata?.name || 'Untitled Project';
      const project = entityManager.createProject(projectName);

      // 1. Parametric -> Spatial -> Geometry -> Assembly
      this.emit('pipeline:progress', { stage: 'Parametric Generation', progress: 30, message: 'Generating structural blueprint...' });
      await this.yield();
      checkAbort();
      const blueprint = new IndustrialBuildingBlueprint();
      blueprint.generate(projectFile.building, entityManager, project.id, abortSignal);

      const graph = entityManager.getGraph();

      // 1.5 Connection Engine
      this.emit('pipeline:progress', { stage: 'Connections', progress: 50, message: 'Evaluating connections and topologies...' });
      await this.yield();
      checkAbort();
      const connectionEngine = new ConnectionEngine();
      connectionEngine.execute(entityManager, project.id, abortSignal);

      // 2. Manufacturing Engine
      this.emit('pipeline:progress', { stage: 'Manufacturing & BOM', progress: 70, message: 'Extracting manufacturing parts and generating BOM...' });
      await this.yield();
      checkAbort();
      const extractor = new PartExtractor(entityManager);
      const parts = extractor.extractFromProject(project.id);
      
      const bomGenerator = new BOMGenerator();
      const bom = bomGenerator.generateBOM(parts, abortSignal);

      // 2.5 Cost Engine
      this.emit('pipeline:progress', { stage: 'Cost Estimation', progress: 85, message: 'Calculating cost estimates...' });
      await this.yield();
      checkAbort();
      const costEstimator = new CostEstimator(new DefaultCostRates());
      const quote = costEstimator.generateQuote(project.id, bom, abortSignal);

      // 3. Document Engine
      this.emit('pipeline:progress', { stage: 'Documentation', progress: 95, message: 'Generating 2D Drawings...' });
      await this.yield();
      checkAbort();
      const partSheetGen = new ManufacturingPartSheetGenerator(entityManager);
      parts.forEach(part => {
        partSheetGen.generate(part, project.version);
      });

      const assemblyGen = new AssemblyDrawingGenerator(entityManager);
      if (project.structuralSystemIds.length > 0) {
        const sysId = project.structuralSystemIds[0];
        const sys = graph.structuralSystems[sysId];
        sys.assemblyIds.forEach(assemblyId => {
          assemblyGen.generate(assemblyId, project.version, 'Generated Assembly');
        });
      }

      this.emit('pipeline:progress', { stage: 'Finalizing', progress: 100, message: 'Generation complete!' });
      await this.yield();
      checkAbort();
      
      this.emit('pipeline:complete', undefined);

      return {
        success: true,
        projectId: project.id,
        summary: {
          totalAssemblies: Object.keys(graph.assemblies).length,
          totalComponents: Object.keys(graph.components).length,
          totalManufacturingParts: parts.length,
          totalDocuments: Object.keys(graph.documents).length
        },
        bom,
        quote,
        entityGraph: graph,
        manufacturingParts: parts
      };

    } catch (error: any) {
      this.emit('pipeline:error', { error, stage: 'Initialization' });
      return {
        success: false,
        errors: [error.message],
        summary: {
          totalAssemblies: 0,
          totalComponents: 0,
          totalManufacturingParts: 0,
          totalDocuments: 0
        }
      };
    }
  }
}
