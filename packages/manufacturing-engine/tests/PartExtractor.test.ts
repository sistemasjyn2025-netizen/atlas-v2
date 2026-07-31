import { EntityManager } from '@atlas/kernel';
import { PartExtractor } from '../src/PartExtractor';
import { Assembly, Component, SteelProfileSpecification } from '@atlas/types';

describe('PartExtractor', () => {
  let entityManager: EntityManager;
  let extractor: PartExtractor;

  beforeEach(() => {
    entityManager = new EntityManager();
    extractor = new PartExtractor(entityManager);
  });

  it('should extract parts from mock assemblies', () => {
    const project = entityManager.createProject('Test Project');
    const graph = entityManager.getGraph();

    const spec: SteelProfileSpecification = {
      id: 'spec-1',
      type: 'Specification',
      specType: 'SteelProfile',
      profile: 'IPN200',
      length: 5000,
      materialRef: 'S275'
    };
    graph.specifications[spec.id] = spec;

    const component1: Component = {
      id: 'comp-1',
      type: 'Component',
      elementIds: [],
      specificationId: spec.id
    };
    graph.components[component1.id] = component1;

    const component2: Component = {
      id: 'comp-2',
      type: 'Component',
      elementIds: [],
      specificationId: spec.id
    };
    graph.components[component2.id] = component2;

    const assembly: Assembly = {
      id: 'asm-1',
      type: 'Assembly',
      componentIds: [component1.id, component2.id],
      subAssemblyIds: [],
      connectionIds: []
    };
    graph.assemblies[assembly.id] = assembly;

    const ss = {
      id: 'ss-1',
      type: 'StructuralSystem' as const,
      assemblyIds: [assembly.id]
    };
    graph.structuralSystems[ss.id] = ss;
    project.structuralSystemIds.push(ss.id);

    const parts = extractor.extractFromProject(project.id);
    expect(parts.length).toBe(1);
    expect(parts[0].profile).toBe('IPN200');
    expect(parts[0].quantity).toBe(2);
    expect(parts[0].sourceEntityIds).toContain(component1.id);
    expect(parts[0].sourceEntityIds).toContain(component2.id);
  });
});
