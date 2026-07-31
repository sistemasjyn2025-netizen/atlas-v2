import { EntityManager } from '@atlas/kernel';
import { Assembly, Component, SteelProfileSpecification } from '@atlas/types';
import { ManufacturingPart } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PartExtractor {
  constructor(private entityManager: EntityManager) {}

  public extractFromAssembly(assemblyId: string): ManufacturingPart[] {
    const graph = this.entityManager.getGraph();
    const assembly = graph.assemblies[assemblyId];
    if (!assembly) {
      throw new Error(`Assembly ${assemblyId} not found`);
    }

    const parts: Map<string, ManufacturingPart> = new Map();

    const processComponent = (componentId: string, parentAssemblyId: string) => {
      const component = graph.components[componentId];
      if (!component || !component.specificationId) return;

      const spec = graph.specifications[component.specificationId];
      if (spec && spec.specType === 'SteelProfile') {
        const steelSpec = spec as SteelProfileSpecification;
        
        // Use a unique key based on geometry/material to group identical parts
        // For now, group by profile, length and materialRef
        const key = `${steelSpec.profile}-${steelSpec.length}-${steelSpec.materialRef}`;

        if (parts.has(key)) {
          const existingPart = parts.get(key)!;
          existingPart.quantity += 1;
          existingPart.sourceEntityIds.push(componentId);
          if (!existingPart.sourceAssemblyIds.includes(parentAssemblyId)) {
            existingPart.sourceAssemblyIds.push(parentAssemblyId);
          }
        } else {
          parts.set(key, {
            id: uuidv4(),
            name: `${steelSpec.profile} Part`,
            profile: steelSpec.profile,
            materialRef: steelSpec.materialRef,
            length: steelSpec.length,
            quantity: 1,
            operations: [],
            sourceEntityIds: [componentId],
            sourceAssemblyIds: [parentAssemblyId]
          });
        }
      } else if (spec && spec.specType === 'Sheet') {
        // Plate parts
        const sheetSpec = spec as any; // Cast generic
        // Key by thickness and material
        const key = `PL-${sheetSpec.thickness}-${sheetSpec.material}`;
        if (parts.has(key)) {
          const existingPart = parts.get(key)!;
          existingPart.quantity += 1;
          existingPart.sourceEntityIds.push(componentId);
          if (!existingPart.sourceAssemblyIds.includes(parentAssemblyId)) {
            existingPart.sourceAssemblyIds.push(parentAssemblyId);
          }
        } else {
          parts.set(key, {
            id: uuidv4(),
            name: `Plate ${sheetSpec.thickness}mm`,
            profile: `PL ${sheetSpec.thickness}`,
            materialRef: sheetSpec.material,
            length: 0,
            quantity: 1,
            operations: [],
            sourceEntityIds: [componentId],
            sourceAssemblyIds: [parentAssemblyId]
          });
        }
      } else if (spec && spec.specType === 'Hardware') {
        // Hardware parts (bolts)
        const hwSpec = spec as any;
        const key = `${hwSpec.hardwareType}-${hwSpec.diameter}x${hwSpec.length}-${hwSpec.grade}`;
        // Since we combined bolts into a single component with multiple elements in GeometryGenerator,
        // we should actually check the component's elements count for the quantity.
        const qty = component.elementIds?.length || 1;
        
        if (parts.has(key)) {
          const existingPart = parts.get(key)!;
          existingPart.quantity += qty;
          existingPart.sourceEntityIds.push(componentId);
          if (!existingPart.sourceAssemblyIds.includes(parentAssemblyId)) {
            existingPart.sourceAssemblyIds.push(parentAssemblyId);
          }
        } else {
          parts.set(key, {
            id: uuidv4(),
            name: `${hwSpec.hardwareType} M${hwSpec.diameter}`,
            profile: `${hwSpec.hardwareType} M${hwSpec.diameter}`,
            materialRef: hwSpec.grade,
            length: hwSpec.length,
            quantity: qty,
            operations: [],
            sourceEntityIds: [componentId],
            sourceAssemblyIds: [parentAssemblyId]
          });
        }
      }
    };

    assembly.componentIds.forEach(id => processComponent(id, assemblyId));

    return Array.from(parts.values());
  }

  public extractFromProject(projectId: string): ManufacturingPart[] {
    const graph = this.entityManager.getGraph();
    const project = graph.projects[projectId];
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const allParts: ManufacturingPart[] = [];
    
    // We would traverse StructuralSystems -> Assemblies
    for (const ssId of project.structuralSystemIds) {
      const ss = graph.structuralSystems[ssId];
      if (ss) {
        for (const assemblyId of ss.assemblyIds) {
          const parts = this.extractFromAssembly(assemblyId);
          allParts.push(...parts);
        }
      }
    }

    // Now group parts globally
    const groupedParts: Map<string, ManufacturingPart> = new Map();
    for (const part of allParts) {
      const key = `${part.profile}-${part.length}-${part.materialRef}`;
      if (groupedParts.has(key)) {
        const existingPart = groupedParts.get(key)!;
        existingPart.quantity += part.quantity;
        existingPart.sourceEntityIds.push(...part.sourceEntityIds);
        
        for (const aId of part.sourceAssemblyIds) {
          if (!existingPart.sourceAssemblyIds.includes(aId)) {
            existingPart.sourceAssemblyIds.push(aId);
          }
        }
      } else {
        groupedParts.set(key, part);
      }
    }

    return Array.from(groupedParts.values());
  }
}
