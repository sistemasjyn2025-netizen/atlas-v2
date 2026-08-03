import React, { useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';

export const WarehouseGenerator: React.FC = () => {
  const { projectInput, setSelectedEntity, selectedEntityId } = useProjectStore();
  
  if (!projectInput) return null;

  const { width, length, height, frameSpacing = 5000, roofPitch = 15, purlinSpacing = 1000, roofType = 'dos-aguas', structureType = 'alma-llena' } = projectInput;
  const numberOfBays = Math.max(1, Math.ceil(length / frameSpacing));

  // Compute meshes
  const frames = useMemo(() => {
    const meshes = [];
    
    const colWidth = 400; 
    const colDepth = 200; 
    const leftColX = -width / 2 + colWidth / 2;
    const rightColX = width / 2 - colWidth / 2;
    const colY = height / 2;
    
    const pitchDecimal = roofPitch / 100;
    const ridgeHeight = roofType === 'un-agua' 
      ? height + width * pitchDecimal 
      : height + (width / 2) * pitchDecimal;

    const angle = roofType === 'un-agua'
      ? Math.atan2(ridgeHeight - height, width)
      : Math.atan2(ridgeHeight - height, width / 2);
      
    const beamLength = roofType === 'un-agua'
      ? Math.sqrt(Math.pow(width, 2) + Math.pow(ridgeHeight - height, 2))
      : Math.sqrt(Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2));

    for (let i = 0; i <= numberOfBays; i++) {
      const zPosition = (i === numberOfBays) ? length : i * frameSpacing;
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

      const rightColHeight = roofType === 'un-agua' ? ridgeHeight : height;
      meshes.push(
        <mesh key={rightColId} position={[rightColX, rightColHeight / 2, centerZ]} userData={{ id: rightColId }}>
          <boxGeometry args={[colWidth, rightColHeight, colDepth]} />
        </mesh>
      );
      
      if (roofType === 'un-agua') {
        meshes.push(
          <mesh key={leftBeamId} position={[0, height + (ridgeHeight - height) / 2, centerZ]} rotation={[0, 0, angle]} userData={{ id: leftBeamId }}>
            <boxGeometry args={[beamLength, colWidth, colDepth]} />
          </mesh>
        );
      } else {
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
    }
    
    // Purlins
    const numPurlinsPerSide = Math.floor(beamLength / purlinSpacing);
    
    const sides = roofType === 'un-agua' ? 1 : 2;
    
    for(let side = 0; side < sides; side++) {
      for(let j = 1; j <= numPurlinsPerSide; j++) {
        const d = j * purlinSpacing;
        
        if (roofType === 'un-agua' || side === 0) {
          // Left side or single slope purlin
          const lX = leftColX + d * Math.cos(angle);
          const lY = height + colWidth/2 + d * Math.sin(angle);
          meshes.push(
            <mesh key={`purlin-${side}-${j}`} position={[lX, lY, 0]} rotation={[0, 0, angle]} userData={{ id: `purlin-${side}-${j}` }}>
              <boxGeometry args={[100, 150, length]} />
            </mesh>
          );
        } else {
          // Right side purlin (only for dos-aguas)
          const rX = rightColX - d * Math.cos(angle);
          const rY = height + colWidth/2 + d * Math.sin(angle);
          meshes.push(
            <mesh key={`purlin-${side}-${j}`} position={[rX, rY, 0]} rotation={[0, 0, -angle]} userData={{ id: `purlin-${side}-${j}` }}>
              <boxGeometry args={[100, 150, length]} />
            </mesh>
          );
        }
      }
    }

    // Bracings
    const baysToBrace = numberOfBays > 1 ? [0, numberOfBays - 1] : [0];
    
    baysToBrace.forEach((bayIndex) => {
      const zStart = bayIndex * frameSpacing - length / 2;
      const zEnd = (bayIndex === numberOfBays - 1 && bayIndex > 0) ? length / 2 : zStart + frameSpacing;
      const actualBaySpacing = zEnd - zStart;
      const bayCenterZ = (zStart + zEnd) / 2;
      
      const localWallAngle = Math.atan2(actualBaySpacing, height);
      const localWallLength = Math.sqrt(height * height + actualBaySpacing * actualBaySpacing);
      const localRoofAngle = Math.atan2(actualBaySpacing, beamLength);
      const localRoofLength = Math.sqrt(beamLength * beamLength + actualBaySpacing * actualBaySpacing);

      const rightColHeight = roofType === 'un-agua' ? ridgeHeight : height;
      const rightLocalWallAngle = Math.atan2(actualBaySpacing, rightColHeight);
      const rightLocalWallLength = Math.sqrt(rightColHeight * rightColHeight + actualBaySpacing * actualBaySpacing);

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
        <mesh key={`brace-wall-R-${bayIndex}-1`} position={[rightColX, rightColHeight / 2, bayCenterZ]} rotation={[rightLocalWallAngle, 0, 0]} userData={{ id: `brace-wall-R-${bayIndex}-1` }}>
          <boxGeometry args={[20, rightLocalWallLength, 20]} />
        </mesh>,
        <mesh key={`brace-wall-R-${bayIndex}-2`} position={[rightColX, rightColHeight / 2, bayCenterZ]} rotation={[-rightLocalWallAngle, 0, 0]} userData={{ id: `brace-wall-R-${bayIndex}-2` }}>
          <boxGeometry args={[20, rightLocalWallLength, 20]} />
        </mesh>
      );

      // Roof
      if (roofType === 'un-agua') {
        meshes.push(
          <group key={`group-roof-L-${bayIndex}`} position={[0, height + (ridgeHeight - height) / 2, bayCenterZ]} rotation={[0, 0, angle]}>
            <mesh key={`brace-roof-L-${bayIndex}-1`} rotation={[0, localRoofAngle, 0]} userData={{ id: `brace-roof-L-${bayIndex}-1` }}>
              <boxGeometry args={[localRoofLength, 20, 20]} />
            </mesh>
            <mesh key={`brace-roof-L-${bayIndex}-2`} rotation={[0, -localRoofAngle, 0]} userData={{ id: `brace-roof-L-${bayIndex}-2` }}>
              <boxGeometry args={[localRoofLength, 20, 20]} />
            </mesh>
          </group>
        );
      } else {
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
      }
    });

    return meshes;
  }, [width, length, height, frameSpacing, roofPitch, purlinSpacing, roofType]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.object.userData && e.object.userData.id) {
      setSelectedEntity(e.object.userData.id);
    }
  };

  const defaultColor = projectInput.structureType === 'reticulado' ? '#c23b22' : '#88929c'; // Industrial red for truss, metallic gray for solid

  return (
    <group onPointerDown={handlePointerDown}>
      {frames.map((element: any, index: number) => {
        if (element.type === 'group') {
          const clonedChildren = React.Children.map(element.props.children, (child: any) => {
            const childId = child.props.userData?.id;
            const childColor = selectedEntityId === childId ? '#f85149' : defaultColor;
            return React.cloneElement(child, {
              castShadow: true,
              receiveShadow: true,
              children: [
                child.props.children,
                <meshStandardMaterial key="mat" color={childColor} metalness={0.6} roughness={0.4} />
              ]
            } as any);
          });
          return React.cloneElement(element, { children: clonedChildren, key: element.key || index } as any);
        } else {
          const id = element.props.userData?.id;
          const color = selectedEntityId === id ? '#f85149' : defaultColor;
          return React.cloneElement(element, {
            key: element.key || index,
            castShadow: true,
            receiveShadow: true,
            children: [
              element.props.children, // boxGeometry
              <meshStandardMaterial key="mat" color={color} metalness={0.6} roughness={0.4} />
            ]
          } as any);
        }
      })}
    </group>
  );
};
