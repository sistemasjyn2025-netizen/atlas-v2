import { ProjectManager } from '@atlas/kernel';
import { IndustrialBuildingBlueprint } from '../src/blueprints/IndustrialBuildingBlueprint';
import { IndustrialBuildingParameters } from '../src/parameters';

describe('IndustrialBuildingBlueprint', () => {
  it('should generate a 50x70 industrial building and maintain relationships', () => {
    const projectManager = new ProjectManager();
    const { document, entityManager } = projectManager.createNewProject('Test Factory');
    
    // Get the created project ID
    const projectIds = Object.keys(entityManager.getGraph().projects);
    const projectId = projectIds[0];

    const blueprint = new IndustrialBuildingBlueprint();
    
    const params: IndustrialBuildingParameters = {
      width: 50,
      length: 70,
      height: 8,
      roofType: 'gable',
      roofSlope: 15,
      baySpacing: 7,
      structuralProfile: 'IPE400'
    };

    // 1. Proving a 50x70 industrial building can be generated
    expect(() => blueprint.generate(params, entityManager, projectId)).not.toThrow();

    const graph = entityManager.getGraph();
    const project = graph.projects[projectId];

    // 2. Entities maintain correct relationships
    expect(project.structuralSystemIds.length).toBe(1);
    
    const sysId = project.structuralSystemIds[0];
    const sys = graph.structuralSystems[sysId];
    expect(sys).toBeDefined();
    
    // 70 / 7 = 10 bays -> 11 frames + 7 gates = 18 assemblies
    expect(sys.assemblyIds.length).toBe(18);

    const firstAssemblyId = sys.assemblyIds[0];
    const firstAssembly = graph.assemblies[firstAssemblyId];
    expect(firstAssembly).toBeDefined();

    // Gable frame should have 2 columns and 2 roof beams = 4 components
    expect(firstAssembly.componentIds.length).toBe(4);

    const firstComponentId = firstAssembly.componentIds[0];
    const firstComponent = graph.components[firstComponentId];
    expect(firstComponent).toBeDefined();
    
    // The component should have at least 1 element
    expect(firstComponent.elementIds.length).toBe(1);
    
    const firstElementId = firstComponent.elementIds[0];
    expect(graph.elements[firstElementId]).toBeDefined();

    // Verify spatial positions
    expect(firstAssembly.transform).toBeDefined();
    expect(firstAssembly.transform?.position.x).toBe(0);
    expect(firstAssembly.transform?.position.y).toBe(0);
    expect(firstAssembly.transform?.position.z).toBe(0);

    const secondAssemblyId = sys.assemblyIds[1];
    const secondAssembly = graph.assemblies[secondAssemblyId];
    expect(secondAssembly.transform?.position.y).toBe(7); // First bay spacing is 7m
    
    const lastAssemblyId = sys.assemblyIds[10];
    const lastAssembly = graph.assemblies[lastAssemblyId];
    expect(lastAssembly.transform?.position.y).toBe(70); // Total length is 70m

    // Verify connections
    expect(firstAssembly.connectionIds.length).toBe(3); // 2 col-beam connections, 1 apex connection
    
    const firstConnectionId = firstAssembly.connectionIds[0];
    const firstConnection = graph.connections[firstConnectionId];
    expect(firstConnection).toBeDefined();
    expect(firstConnection.connectedEntityIds.length).toBe(2);

    // 3. Serialization to .atlas remains valid
    const serialized = projectManager.serialize({
      metadata: document.metadata,
      graph: graph,
      parameters: params
    });
    
    expect(typeof serialized).toBe('string');
    
    const { document: deserialized } = projectManager.deserialize(serialized);
    expect(deserialized.metadata.formatVersion).toBe('0.1');
    expect(Object.keys(deserialized.graph.assemblies).length).toBe(18);
  });

  it('should fail validation on invalid dimensions', () => {
    const projectManager = new ProjectManager();
    const { entityManager } = projectManager.createNewProject('Invalid Factory');
    const projectId = Object.keys(entityManager.getGraph().projects)[0];
    
    const blueprint = new IndustrialBuildingBlueprint();
    
    const params: IndustrialBuildingParameters = {
      width: -50, // Invalid
      length: 70,
      height: 8,
      roofType: 'gable',
      roofSlope: 15,
      baySpacing: 7,
      structuralProfile: 'IPE400'
    };

    expect(() => blueprint.generate(params, entityManager, projectId)).toThrow(/Width must be greater than 0/);
  });
});
