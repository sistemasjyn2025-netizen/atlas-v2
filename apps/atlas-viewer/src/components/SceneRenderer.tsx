import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useSelectionContext } from '../contexts/SelectionContext';
import { useViewportContext } from '../contexts/ViewportContext';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Outline } from '@react-three/postprocessing';

export function SceneRenderer({ sceneGroup }: { sceneGroup: THREE.Group | null }) {
  const { selectedEntityId, hoveredEntityId } = useSelectionContext();
  const { selectionMap, hardwareLod } = useViewportContext();
  const { camera, scene } = useThree();
  
  const [hoveredMeshes, setHoveredMeshes] = useState<THREE.Mesh[]>([]);
  const [selectedMeshes, setSelectedMeshes] = useState<THREE.Mesh[]>([]);
  const [searchMeshes, setSearchMeshes] = useState<THREE.Mesh[]>([]); // For future search highlighting

  // We maintain a reference to proxy meshes added to the scene for outlining
  const proxyGroupRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    if (!sceneGroup) return;

    let selectedRenderIds = new Set<string>();
    let hoveredRenderIds = new Set<string>();

    selectionMap.forEach((mapping, renderId) => {
      if (mapping.sourceEntityId === selectedEntityId) selectedRenderIds.add(renderId);
      if (mapping.sourceEntityId === hoveredEntityId) hoveredRenderIds.add(renderId);
    });

    const newSelected: THREE.Mesh[] = [];
    const newHovered: THREE.Mesh[] = [];

    // Clear old proxies
    proxyGroupRef.current.clear();

    const tempMatrix = new THREE.Matrix4();
    const proxyMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Needs to be in scene but invisible

    sceneGroup.traverse((obj: any) => {
      // Handle legacy Meshes (if any remain)
      if (obj.isMesh && !obj.isInstancedMesh) {
        let current = obj;
        let foundRenderId = null;
        while (current) {
          if (current.userData && current.userData.renderId) {
            foundRenderId = current.userData.renderId;
            break;
          }
          current = current.parent;
        }
        if (foundRenderId) {
          if (selectedRenderIds.has(foundRenderId)) newSelected.push(obj);
          else if (hoveredRenderIds.has(foundRenderId)) newHovered.push(obj);
        }
      }

      // Handle InstancedMeshes
      if (obj.isInstancedMesh && obj.userData.instanceMap) {
        for (let i = 0; i < obj.count; i++) {
          const renderId = obj.userData.instanceMap[i];
          if (renderId) {
            let isSelected = selectedRenderIds.has(renderId);
            let isHovered = hoveredRenderIds.has(renderId);
            
            if (isSelected || isHovered) {
              obj.getMatrixAt(i, tempMatrix);
              const proxy = new THREE.Mesh(obj.geometry, proxyMaterial);
              proxy.applyMatrix4(tempMatrix);
              proxy.updateMatrixWorld(true);
              proxyGroupRef.current.add(proxy);
              
              if (isSelected) newSelected.push(proxy);
              else if (isHovered) newHovered.push(proxy);
            }
          }
        }
      }
    });

    setSelectedMeshes(newSelected);
    setHoveredMeshes(newHovered);
  }, [sceneGroup, selectedEntityId, hoveredEntityId, selectionMap]);

  return (
    <>
      {sceneGroup && <primitive object={sceneGroup} />}
      <primitive object={proxyGroupRef.current} />
      
      <EffectComposer autoClear={false} multisampling={4}>
        {hoveredMeshes.length > 0 ? <Outline selection={hoveredMeshes} visibleEdgeColor={0x58a6ff} hiddenEdgeColor={0x58a6ff} edgeStrength={1.5} blendFunction={13} /> : <></>}
        {selectedMeshes.length > 0 ? <Outline selection={selectedMeshes} visibleEdgeColor={0x0969da} hiddenEdgeColor={0x0969da} edgeStrength={3} blendFunction={13} /> : <></>}
        {searchMeshes.length > 0 ? <Outline selection={searchMeshes} visibleEdgeColor={0xffff00} hiddenEdgeColor={0xffff00} edgeStrength={3} blendFunction={13} /> : <></>}
      </EffectComposer>
    </>
  );
}
