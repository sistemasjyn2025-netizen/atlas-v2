import { AtlasToRenderAdapter } from '../src/AtlasToRenderAdapter';
import { EntityGraph } from '@atlas/types';

describe('AtlasToRenderAdapter', () => {
  it('should translate assemblies and components to RenderNodes', () => {
    const adapter = new AtlasToRenderAdapter();
    const mockGraph: EntityGraph = {
      projects: {},
      structuralSystems: {
        'sys1': { id: 'sys1', type: 'StructuralSystem', assemblyIds: ['asm1'] }
      },
      assemblies: {
        'asm1': { id: 'asm1', type: 'Assembly', componentIds: ['comp1'], subAssemblyIds: [], connectionIds: [] }
      },
      subAssemblies: {},
      components: {
        'comp1': { id: 'comp1', type: 'Component', elementIds: ['elem1'] }
      },
      elements: {
        'elem1': { id: 'elem1', type: 'Element', geometryId: '' }
      },
      geometries: {},
      connections: {},
      joints: {},
      specifications: {},
      documents: {},
      sheets: {},
      views: {},
      dimensions: {},
      annotations: {}
    };

    const { scene, selectionMap } = adapter.convert(mockGraph);
    expect(scene.root).toBeDefined();
    expect(scene.root.children.length).toBe(1);
    
    // ASM -> COMP -> ELEM
    const asmNode = scene.root.children[0];
    expect(asmNode.metadata.type).toBe('Assembly');
    expect(asmNode.children.length).toBe(1);

    const compNode = asmNode.children[0];
    expect(compNode.metadata.type).toBe('Component');
    
    // Verify selection mapping
    expect(selectionMap.has(asmNode.renderId)).toBe(true);
    expect(selectionMap.has(compNode.renderId)).toBe(true);
  });
});
