import { v4 as uuidv4 } from 'uuid';
import { EntityManager } from '@atlas/kernel';
import { StructuralSystem, Component, SteelProfileSpecification } from '@atlas/types';
import { Blueprint } from './Blueprint';
import { IndustrialBuildingParameters } from '../parameters';
import { ParameterValidator } from '../validation/ParameterValidator';
import { AssemblyBuilder } from '@atlas/assembly-engine';

export class IndustrialBuildingBlueprint implements Blueprint<IndustrialBuildingParameters> {
  name = 'Industrial Building';
  private validator = new ParameterValidator();

  generate(params: IndustrialBuildingParameters, entityManager: EntityManager, projectId: string, abortSignal?: AbortSignal): void {
    const checkAbort = () => {
      if (abortSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
    };
    const validation = this.validator.validateIndustrialBuilding(params);
    if (!validation.isValid) {
      throw new Error(`Invalid parameters for Industrial Building: ${validation.errors.join(' ')}`);
    }

    const graph = entityManager.getGraph();
    const project = graph.projects[projectId];
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const builder = new AssemblyBuilder(entityManager);

    const structuralSystem: StructuralSystem = {
      id: uuidv4(),
      type: 'StructuralSystem',
      assemblyIds: []
    };
    graph.structuralSystems[structuralSystem.id] = structuralSystem;
    project.structuralSystemIds.push(structuralSystem.id);

    // Common Specifications
    const mainProfile = params.mainProfileId ? params.mainProfileId.replace(/\s+/g, '') : 'IPN200';
    const columnSpec = builder.createSpecification<SteelProfileSpecification>({
      specType: 'SteelProfile',
      profile: mainProfile,
      length: params.height,
      materialRef: 'S275'
    });

    const roofBeamLength = params.roofType === 'gable' ? (params.width / 2) / Math.cos(Math.PI / 12) : params.width;
    
    const roofBeamSpec = builder.createSpecification<SteelProfileSpecification>({
      specType: 'SteelProfile',
      profile: 'IPN160',
      length: roofBeamLength,
      materialRef: 'S275'
    });

    const gateProfileSpec = builder.createSpecification<SteelProfileSpecification>({
      specType: 'SteelProfile',
      profile: 'Tube_100x100x3',
      length: 6000, // standard gate length 6m for example
      materialRef: 'S275'
    });

    // Helper for Quaternion rotation around Y axis
    const eulerToQuatY = (angleRads: number) => {
      return { x: 0, y: Math.sin(angleRads / 2), z: 0, w: Math.cos(angleRads / 2) };
    };

    const numFrames = Math.floor(params.length / params.baySpacing) + 1;
    const slopeRads = Math.atan(params.roofSlope / 100);

    for (let i = 0; i < numFrames; i++) {
      checkAbort(); // Check abort on frame boundary

      const yPosition = (i * params.baySpacing) - (params.length / 2); // Center along Y
      
      const frameAssembly = builder.createAssembly({
        position: { x: 0, y: yPosition, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      });
      structuralSystem.assemblyIds.push(frameAssembly.id);

      // Left Column
      const leftColX = -params.width / 2;
      const leftColumn = builder.createComponent(frameAssembly.id, { position: { x: leftColX, y: 0, z: params.height / 2 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, columnSpec.id);
      builder.createElement(leftColumn.id, { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, columnSpec.id);

      // Right Column
      const rightColX = params.width / 2;
      const rightColumn = builder.createComponent(frameAssembly.id, { position: { x: rightColX, y: 0, z: params.height / 2 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, columnSpec.id);
      builder.createElement(rightColumn.id, { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, columnSpec.id);

      let roofBeams: Component[] = [];
      if (params.roofType === 'gable') {
        const rafterLength = roofBeamLength;
        const rafterZ = params.height + (rafterLength * Math.sin(slopeRads)) / 2;
        
        // Left Rafter
        const leftRafterX = leftColX + (rafterLength * Math.cos(slopeRads)) / 2;
        const leftRoofBeam = builder.createComponent(frameAssembly.id, { position: { x: leftRafterX, y: 0, z: rafterZ }, rotation: eulerToQuatY(-slopeRads) }, roofBeamSpec.id);
        builder.createElement(leftRoofBeam.id, { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, roofBeamSpec.id);
        
        // Right Rafter
        const rightRafterX = rightColX - (rafterLength * Math.cos(slopeRads)) / 2;
        const rightRoofBeam = builder.createComponent(frameAssembly.id, { position: { x: rightRafterX, y: 0, z: rafterZ }, rotation: eulerToQuatY(slopeRads) }, roofBeamSpec.id);
        builder.createElement(rightRoofBeam.id, { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, roofBeamSpec.id);
        
        roofBeams = [leftRoofBeam, rightRoofBeam];
      } else {
        const roofBeam = builder.createComponent(frameAssembly.id, { position: { x: 0, y: 0, z: params.height }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, roofBeamSpec.id);
        builder.createElement(roofBeam.id, { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, roofBeamSpec.id);
        roofBeams = [roofBeam];
      }

      if (roofBeams.length > 0) {
        builder.createConnection(frameAssembly.id, [leftColumn.id, roofBeams[0].id]);
        builder.createConnection(frameAssembly.id, [rightColumn.id, roofBeams[roofBeams.length - 1].id]);
      }
      if (roofBeams.length === 2) {
        builder.createConnection(frameAssembly.id, [roofBeams[0].id, roofBeams[1].id]);
      }
    }

    // --- Generate Purlins (Correas) ---
    const purlinSpec = builder.createSpecification<SteelProfileSpecification>({
      specType: 'SteelProfile',
      profile: 'C100x50x15x2', // Typical cold-formed C section
      length: params.length,
      materialRef: 'S275'
    });

    const roofAssembly = builder.createAssembly({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 }
    });
    structuralSystem.assemblyIds.push(roofAssembly.id);

    // Calculate purlin spacing (approx 1 meter = 1000 mm)
    const purlinSpacing = 1000.0; 
    const purlinsPerSlope = Math.floor(roofBeamLength / purlinSpacing);

    if (params.roofType === 'gable') {
      // For both slopes (left and right)
      for (let side of [-1, 1]) {
        checkAbort(); // Check abort on roof slope boundary
        for (let j = 0; j <= purlinsPerSlope; j++) {
          const distanceUpSlope = j * purlinSpacing;
          const deltaX = distanceUpSlope * Math.cos(slopeRads);
          const deltaZ = distanceUpSlope * Math.sin(slopeRads);

          // Base of the slope is the column top
          const colX = (params.width / 2) * side;
          const colZ = params.height;

          const pX = colX + (deltaX * -side);
          const pZ = colZ + deltaZ;
          
          // Rotate 90 degrees around X so the purlin runs along Y
          const qx = Math.sin(Math.PI / 4);
          const qw = Math.cos(Math.PI / 4);

          const purlin = builder.createComponent(roofAssembly.id, { 
            position: { x: pX, y: 0, z: pZ }, 
            rotation: { x: qx, y: 0, z: 0, w: qw } 
          }, purlinSpec.id);
          builder.createElement(purlin.id, { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }, purlinSpec.id);
        }
      }
    }

    // Add Gates
    // Front: 3 independent sliding gates
    for (let i = 0; i < 3; i++) {
      const gateAssembly = builder.createAssembly();
      structuralSystem.assemblyIds.push(gateAssembly.id);
      builder.createComponent(gateAssembly.id, undefined, gateProfileSpec.id);
    }
    
    // Rear: 3 independent sliding gates
    for (let i = 0; i < 3; i++) {
      const gateAssembly = builder.createAssembly();
      structuralSystem.assemblyIds.push(gateAssembly.id);
      builder.createComponent(gateAssembly.id, undefined, gateProfileSpec.id);
    }

    // Side: 1 double leaf gate
    const sideGateAssembly = builder.createAssembly();
    structuralSystem.assemblyIds.push(sideGateAssembly.id);
    // Two leaves
    builder.createComponent(sideGateAssembly.id, undefined, gateProfileSpec.id);
    builder.createComponent(sideGateAssembly.id, undefined, gateProfileSpec.id);
  }
}
