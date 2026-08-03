import { create } from 'zustand';

interface ProjectInput {
  width: number;
  length: number;
  height: number;
  roofPitch: number;
  frameSpacing?: number;
  purlinSpacing?: number;
  roofType?: string;
  structureType?: string;
  [key: string]: any;
}

interface ProjectState {
  projectInput: ProjectInput;
  selectedEntityId: string | null;
  entities: any[];
  isReadOnly: boolean;
  cameraView: 'iso' | 'top' | 'front';
  resetCamera: number;
  setProjectInput: (input: Partial<ProjectInput>) => void;
  setHydratedProject: (input: ProjectInput, entities: any[]) => void;
  setSelectedEntity: (id: string | null) => void;
  setEntities: (entities: any[]) => void;
  setReadOnly: (val: boolean) => void;
  setCameraView: (view: 'iso' | 'top' | 'front') => void;
  triggerCameraReset: () => void;
}

const computeEntities = (input: ProjectInput) => {
  const { width, length, height, frameSpacing = 5000, roofPitch = 15, purlinSpacing = 1000, roofType = 'dos-aguas', structureType = 'alma-llena' } = input;
  const numberOfBays = Math.max(1, Math.ceil(length / frameSpacing));
  const entities = [];
  
  const colWidth = 400; 
  const leftColX = -width / 2 + colWidth / 2;
  const rightColX = width / 2 - colWidth / 2;
  
  const pitchDecimal = roofPitch / 100;
  const ridgeHeight = roofType === 'un-agua' 
    ? height + width * pitchDecimal 
    : height + (width / 2) * pitchDecimal;
    
  const beamLength = roofType === 'un-agua'
    ? Math.sqrt(Math.pow(width, 2) + Math.pow(ridgeHeight - height, 2))
    : Math.sqrt(Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2));

  for (let i = 0; i <= numberOfBays; i++) {
    const leftColId = `portico-${i}-col-izq`;
    const rightColId = `portico-${i}-col-der`;
    const leftBeamId = `portico-${i}-viga-izq`;
    const rightBeamId = `portico-${i}-viga-der`;

    const zPosition = (i === numberOfBays) ? length : i * frameSpacing;
    const centerZ = zPosition - length / 2; 

    entities.push({ 
      id: leftColId, parent: `Pórtico ${i + 1}`, name: 'Columna Izquierda', type: 'Column', length: height, material: 'Steel W-Profile',
      position: { x: leftColX, y: 0, z: centerZ }
    });
    
    const rightColHeight = roofType === 'un-agua' ? ridgeHeight : height;
    
    entities.push({ 
      id: rightColId, parent: `Pórtico ${i + 1}`, name: 'Columna Derecha', type: 'Column', length: rightColHeight, material: 'Steel W-Profile',
      position: { x: rightColX, y: 0, z: centerZ }
    });

    if (roofType === 'un-agua') {
      entities.push({ id: leftBeamId, parent: `Pórtico ${i + 1}`, name: 'Viga Principal', type: 'Beam', length: Math.round(beamLength), material: 'Steel W-Profile' });
    } else {
      entities.push({ id: leftBeamId, parent: `Pórtico ${i + 1}`, name: 'Viga Izquierda', type: 'Beam', length: Math.round(beamLength), material: 'Steel W-Profile' });
      entities.push({ id: rightBeamId, parent: `Pórtico ${i + 1}`, name: 'Viga Derecha', type: 'Beam', length: Math.round(beamLength), material: 'Steel W-Profile' });
    }
  }

  // Purlins (Correas)
  const numPurlinsPerSide = Math.floor(beamLength / purlinSpacing);
  const sides = roofType === 'un-agua' ? 1 : 2;
  for(let side = 0; side < sides; side++) {
    const sideName = sides === 1 ? 'Única' : (side === 0 ? 'Izquierda' : 'Derecha');
    for(let j = 1; j <= numPurlinsPerSide; j++) {
      entities.push({
        id: `purlin-${side}-${j}`,
        parent: 'Estructura Secundaria',
        name: `Correa ${sideName} ${j}`,
        type: 'Purlin',
        length: length,
        material: 'Cold-Formed C-Profile'
      });
    }
  }

  // Bracings (Cruces)
  const addBracing = (id: string, name: string, bracelength: number) => {
    entities.push({
      id, parent: 'Arriostramientos', name, type: 'Bracing', length: Math.round(bracelength), material: 'Steel Rod'
    });
  };

  const wallBraceLength = Math.sqrt(height * height + frameSpacing * frameSpacing);
  const roofBraceLength = Math.sqrt(beamLength * beamLength + frameSpacing * frameSpacing);

  const baysToBrace = numberOfBays > 1 ? [0, numberOfBays - 1] : [0];
  baysToBrace.forEach((bayIndex) => {
    // Side Walls
    addBracing(`brace-wall-L-${bayIndex}-1`, `Cruz Muro Izq Vano ${bayIndex+1} (A)`, wallBraceLength);
    addBracing(`brace-wall-L-${bayIndex}-2`, `Cruz Muro Izq Vano ${bayIndex+1} (B)`, wallBraceLength);
    
    const rightColHeight = roofType === 'un-agua' ? ridgeHeight : height;
    const rightWallBraceLength = Math.sqrt(rightColHeight * rightColHeight + frameSpacing * frameSpacing);
    
    addBracing(`brace-wall-R-${bayIndex}-1`, `Cruz Muro Der Vano ${bayIndex+1} (A)`, rightWallBraceLength);
    addBracing(`brace-wall-R-${bayIndex}-2`, `Cruz Muro Der Vano ${bayIndex+1} (B)`, rightWallBraceLength);
    
    // Roof
    addBracing(`brace-roof-L-${bayIndex}-1`, `Cruz Techo Izq Vano ${bayIndex+1} (A)`, roofBraceLength);
    addBracing(`brace-roof-L-${bayIndex}-2`, `Cruz Techo Izq Vano ${bayIndex+1} (B)`, roofBraceLength);
    
    if (roofType !== 'un-agua') {
      addBracing(`brace-roof-R-${bayIndex}-1`, `Cruz Techo Der Vano ${bayIndex+1} (A)`, roofBraceLength);
      addBracing(`brace-roof-R-${bayIndex}-2`, `Cruz Techo Der Vano ${bayIndex+1} (B)`, roofBraceLength);
    }
  });

  return entities;
};

const defaultInput: ProjectInput = {
  width: 15000,
  length: 30000,
  height: 6000,
  roofPitch: 15,
  frameSpacing: 5000,
  purlinSpacing: 1000,
  roofType: 'dos-aguas',
  structureType: 'alma-llena',
  pricePerKg: 2.5
};

export const useProjectStore = create<ProjectState>((set) => ({
  projectInput: defaultInput,
  selectedEntityId: null,
  entities: computeEntities(defaultInput),
  isReadOnly: false,
  cameraView: 'iso',
  resetCamera: 0,

  setProjectInput: (input) => 
    set((state) => {
      const newProjectInput = { ...state.projectInput, ...input };
      return { 
        projectInput: newProjectInput,
        entities: computeEntities(newProjectInput)
      };
    }),
    
  setHydratedProject: (input, entities) =>
    set(() => ({
      projectInput: input,
      entities: entities
    })),
    
  setSelectedEntity: (id) => 
    set(() => ({ selectedEntityId: id })),
    
  setEntities: (entities) => 
    set(() => ({ entities })),
    
  setReadOnly: (val) =>
    set(() => ({ isReadOnly: val })),
    
  setCameraView: (view) =>
    set(() => ({ cameraView: view })),
    
  triggerCameraReset: () =>
    set((state) => ({ resetCamera: state.resetCamera + 1 })),
}));
