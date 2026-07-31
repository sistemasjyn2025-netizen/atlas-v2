import { create } from 'zustand';

interface ProjectInput {
  width: number;
  length: number;
  height: number;
  roofSlope: number;
  baySpacing?: number;
  [key: string]: any;
}

interface ProjectState {
  projectInput: ProjectInput;
  selectedEntityId: string | null;
  entities: any[];
  setProjectInput: (input: Partial<ProjectInput>) => void;
  setSelectedEntity: (id: string | null) => void;
  setEntities: (entities: any[]) => void;
}

const computeEntities = (input: ProjectInput) => {
  const { width, length, height, baySpacing = 5000, roofSlope = 0.15 } = input;
  const numberOfBays = Math.max(1, Math.ceil(length / baySpacing));
  const entities = [];
  
  const colWidth = 400; 
  const leftColX = -width / 2 + colWidth / 2;
  const rightColX = width / 2 - colWidth / 2;
  const ridgeHeight = height + (width / 2) * roofSlope;
  const beamLength = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2));

  for (let i = 0; i <= numberOfBays; i++) {
    const leftColId = `portico-${i}-col-izq`;
    const rightColId = `portico-${i}-col-der`;
    const leftBeamId = `portico-${i}-viga-izq`;
    const rightBeamId = `portico-${i}-viga-der`;

    const zPosition = (i === numberOfBays) ? length : i * baySpacing;
    const centerZ = zPosition - length / 2; 

    entities.push({ 
      id: leftColId, parent: `Pórtico ${i + 1}`, name: 'Columna Izquierda', type: 'Column', length: height, material: 'Steel W-Profile',
      position: { x: leftColX, y: 0, z: centerZ }
    });
    entities.push({ 
      id: rightColId, parent: `Pórtico ${i + 1}`, name: 'Columna Derecha', type: 'Column', length: height, material: 'Steel W-Profile',
      position: { x: rightColX, y: 0, z: centerZ }
    });

    entities.push({ id: leftBeamId, parent: `Pórtico ${i + 1}`, name: 'Viga Izquierda', type: 'Beam', length: Math.round(beamLength), material: 'Steel W-Profile' });
    entities.push({ id: rightBeamId, parent: `Pórtico ${i + 1}`, name: 'Viga Derecha', type: 'Beam', length: Math.round(beamLength), material: 'Steel W-Profile' });
  }

  // Purlins (Correas)
  const purlinSpacing = 1200;
  const numPurlinsPerSide = Math.floor(beamLength / purlinSpacing);
  for(let side = 0; side < 2; side++) {
    const sideName = side === 0 ? 'Izquierda' : 'Derecha';
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

  const wallBraceLength = Math.sqrt(height * height + baySpacing * baySpacing);
  const roofBraceLength = Math.sqrt(beamLength * beamLength + baySpacing * baySpacing);

  const baysToBrace = numberOfBays > 1 ? [0, numberOfBays - 1] : [0];
  baysToBrace.forEach((bayIndex) => {
    // Side Walls
    addBracing(`brace-wall-L-${bayIndex}-1`, `Cruz Muro Izq Vano ${bayIndex+1} (A)`, wallBraceLength);
    addBracing(`brace-wall-L-${bayIndex}-2`, `Cruz Muro Izq Vano ${bayIndex+1} (B)`, wallBraceLength);
    addBracing(`brace-wall-R-${bayIndex}-1`, `Cruz Muro Der Vano ${bayIndex+1} (A)`, wallBraceLength);
    addBracing(`brace-wall-R-${bayIndex}-2`, `Cruz Muro Der Vano ${bayIndex+1} (B)`, wallBraceLength);
    
    // Roof
    addBracing(`brace-roof-L-${bayIndex}-1`, `Cruz Techo Izq Vano ${bayIndex+1} (A)`, roofBraceLength);
    addBracing(`brace-roof-L-${bayIndex}-2`, `Cruz Techo Izq Vano ${bayIndex+1} (B)`, roofBraceLength);
    addBracing(`brace-roof-R-${bayIndex}-1`, `Cruz Techo Der Vano ${bayIndex+1} (A)`, roofBraceLength);
    addBracing(`brace-roof-R-${bayIndex}-2`, `Cruz Techo Der Vano ${bayIndex+1} (B)`, roofBraceLength);
  });

  return entities;
};

const defaultInput = {
  width: 15000,
  length: 30000,
  height: 6000,
  roofSlope: 0.15,
  baySpacing: 5000
};

export const useProjectStore = create<ProjectState>((set) => ({
  projectInput: defaultInput,
  selectedEntityId: null,
  entities: computeEntities(defaultInput),

  setProjectInput: (input) => 
    set((state) => {
      const newProjectInput = { ...state.projectInput, ...input };
      return { 
        projectInput: newProjectInput,
        entities: computeEntities(newProjectInput)
      };
    }),
    
  setSelectedEntity: (id) => 
    set(() => ({ selectedEntityId: id })),
    
  setEntities: (entities) => 
    set(() => ({ entities })),
}));
