import React, { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';

export const WarehouseGenerator: React.FC = () => {
  const { projectInput, setSelectedEntity, selectedEntityId } = useProjectStore();
  
  if (!projectInput) return null;

  const { width, length, height, baySpacing = 5000, roofSlope = 0.15 } = projectInput;
  const numberOfBays = Math.max(1, Math.ceil(length / baySpacing));

  // Compute meshes
  const frames = useMemo(() => {
    const meshes = [];
    
    const colWidth = 400; 
    const colDepth = 200; 
    const leftColX = -width / 2 + colWidth / 2;
    const rightColX = width / 2 - colWidth / 2;
    const colY = height / 2;
    const ridgeHeight = height + (width / 2) * roofSlope;
    const beamLength = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2));
    const angle = Math.atan2(ridgeHeight - height, width / 2);

    for (let i = 0; i <= numberOfBays; i++) {
      const zPosition = (i === numberOfBays) ? length : i * baySpacing;
      const centerZ = zPosition - length / 2; 

      const leftColId = `portico-${i}-col-izq`;
      const rightColId = `portico-${i}-col-der`;
      const leftBeamId = `portico-${i}-viga-izq`;
      const rightBeamId = `portico-${i}-viga-der`;

      meshes.push(
        <mesh key={leftColId} position={[leftColX, colY, centerZ]} userData={{ id: leftColId }}>
          <boxGeometry args={[colWidth, height, colDepth]} />
        </mesh>
      );

      meshes.push(
        <mesh key={rightColId} position={[rightColX, colY, centerZ]} userData={{ id: rightColId }}>
          <boxGeometry args={[colWidth, height, colDepth]} />
        </mesh>
      );
      
      meshes.push(
        <mesh key={leftBeamId} position={[leftColX / 2, height + (ridgeHeight - height) / 2, centerZ]} rotation={[0, 0, angle]} userData={{ id: leftBeamId }}>
          <boxGeometry args={[beamLength, colWidth, colDepth]} />
        </mesh>
      );

      meshes.push(
        <mesh key={rightBeamId} position={[rightColX / 2, height + (ridgeHeight - height) / 2, centerZ]} rotation={[0, 0, -angle]} userData={{ id: rightBeamId }}>
          <boxGeometry args={[beamLength, colWidth, colDepth]} />
        </mesh>
      );
    }
    
    // Purlins
    const purlinSpacing = 1200;
    const numPurlinsPerSide = Math.floor(beamLength / purlinSpacing);
    for(let j = 1; j <= numPurlinsPerSide; j++) {
      const d = j * purlinSpacing;
      
      // Left side purlin
      const lX = leftColX + d * Math.cos(angle);
      const lY = height + colWidth/2 + d * Math.sin(angle); // slightly above beam
      meshes.push(
        <mesh key={`purlin-0-${j}`} position={[lX, lY, 0]} rotation={[0, 0, angle]} userData={{ id: `purlin-0-${j}` }}>
          <boxGeometry args={[100, 150, length]} />
        </mesh>
      );

      // Right side purlin
      const rX = rightColX - d * Math.cos(angle);
      const rY = height + colWidth/2 + d * Math.sin(angle);
      meshes.push(
        <mesh key={`purlin-1-${j}`} position={[rX, rY, 0]} rotation={[0, 0, -angle]} userData={{ id: `purlin-1-${j}` }}>
          <boxGeometry args={[100, 150, length]} />
        </mesh>
      );
    }

    // Bracings
    const wallBraceLength = Math.sqrt(height * height + baySpacing * baySpacing);
    const roofBraceLength = Math.sqrt(beamLength * beamLength + baySpacing * baySpacing);
    const wallBraceAngle = Math.atan2(baySpacing, height);
    const roofBraceAngle = Math.atan2(baySpacing, beamLength);

    const baysToBrace = numberOfBays > 1 ? [0, numberOfBays - 1] : [0];
    
    baysToBrace.forEach((bayIndex) => {
      const zStart = bayIndex * baySpacing - length / 2;
      const zEnd = (bayIndex === numberOfBays - 1 && bayIndex > 0) ? length / 2 : zStart + baySpacing;
      const actualBaySpacing = zEnd - zStart;
      const bayCenterZ = (zStart + zEnd) / 2;
      
      const localWallAngle = Math.atan2(actualBaySpacing, height);
      const localWallLength = Math.sqrt(height * height + actualBaySpacing * actualBaySpacing);
      const localRoofAngle = Math.atan2(actualBaySpacing, beamLength);
      const localRoofLength = Math.sqrt(beamLength * beamLength + actualBaySpacing * actualBaySpacing);

      // Left Wall
      meshes.push(
        <mesh key={`brace-wall-L-${bayIndex}-1`} position={[leftColX, colY, bayCenterZ]} rotation={[localWallAngle, 0, 0]} userData={{ id: `brace-wall-L-${bayIndex}-1` }}>
          <boxGeometry args={[20, localWallLength, 20]} />
        </mesh>,
        <mesh key={`brace-wall-L-${bayIndex}-2`} position={[leftColX, colY, bayCenterZ]} rotation={[-localWallAngle, 0, 0]} userData={{ id: `brace-wall-L-${bayIndex}-2` }}>
          <boxGeometry args={[20, localWallLength, 20]} />
        </mesh>
      );

      // Right Wall
      meshes.push(
        <mesh key={`brace-wall-R-${bayIndex}-1`} position={[rightColX, colY, bayCenterZ]} rotation={[localWallAngle, 0, 0]} userData={{ id: `brace-wall-R-${bayIndex}-1` }}>
          <boxGeometry args={[20, localWallLength, 20]} />
        </mesh>,
        <mesh key={`brace-wall-R-${bayIndex}-2`} position={[rightColX, colY, bayCenterZ]} rotation={[-localWallAngle, 0, 0]} userData={{ id: `brace-wall-R-${bayIndex}-2` }}>
          <boxGeometry args={[20, localWallLength, 20]} />
        </mesh>
      );

      // Left Roof
      meshes.push(
        <group key={`group-roof-L-${bayIndex}`} position={[leftColX / 2, height + (ridgeHeight - height) / 2, bayCenterZ]} rotation={[0, 0, angle]}>
          <mesh key={`brace-roof-L-${bayIndex}-1`} rotation={[0, localRoofAngle, 0]} userData={{ id: `brace-roof-L-${bayIndex}-1` }}>
            <boxGeometry args={[localRoofLength, 20, 20]} />
          </mesh>
          <mesh key={`brace-roof-L-${bayIndex}-2`} rotation={[0, -localRoofAngle, 0]} userData={{ id: `brace-roof-L-${bayIndex}-2` }}>
            <boxGeometry args={[localRoofLength, 20, 20]} />
          </mesh>
        </group>
      );

      // Right Roof
      meshes.push(
        <group key={`group-roof-R-${bayIndex}`} position={[rightColX / 2, height + (ridgeHeight - height) / 2, bayCenterZ]} rotation={[0, 0, -angle]}>
          <mesh key={`brace-roof-R-${bayIndex}-1`} rotation={[0, localRoofAngle, 0]} userData={{ id: `brace-roof-R-${bayIndex}-1` }}>
            <boxGeometry args={[localRoofLength, 20, 20]} />
          </mesh>
          <mesh key={`brace-roof-R-${bayIndex}-2`} rotation={[0, -localRoofAngle, 0]} userData={{ id: `brace-roof-R-${bayIndex}-2` }}>
            <boxGeometry args={[localRoofLength, 20, 20]} />
          </mesh>
        </group>
      );
    });

    return meshes;
  }, [width, length, height, baySpacing, roofSlope]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.object.userData && e.object.userData.id) {
      setSelectedEntity(e.object.userData.id);
    }
  };

  return (
    <group onPointerDown={handlePointerDown}>
      {frames.map((mesh) => {
        const id = mesh.props.userData.id;
        const color = selectedEntityId === id ? '#f85149' : '#58a6ff';
        return React.cloneElement(mesh, {
          children: [
            mesh.props.children, // boxGeometry
            <meshStandardMaterial key="mat" color={color} />
          ]
        });
      })}
    </group>
  );
};
