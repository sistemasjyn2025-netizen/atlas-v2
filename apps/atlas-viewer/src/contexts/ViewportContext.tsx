import { createContext, useContext } from 'react';
import type { SelectionMapping } from '@atlas/renderer-core';

export interface ViewportState {
  hardwareLod: 'auto' | 'low' | 'med' | 'high';
  setHardwareLod: (lod: 'auto' | 'low' | 'med' | 'high') => void;
  selectionMap: Map<string, SelectionMapping>;
  viewMode: 'iso' | 'top' | 'front';
  setViewMode: (mode: 'iso' | 'top' | 'front') => void;
}

export const ViewportContext = createContext<ViewportState>({
  hardwareLod: 'auto',
  setHardwareLod: () => {},
  selectionMap: new Map(),
  viewMode: 'iso',
  setViewMode: () => {}
});

export const useViewportContext = () => useContext(ViewportContext);
