import { createContext, useContext } from 'react';

export interface SelectionState {
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  hoveredEntityId: string | null;
  setHoveredEntityId: (id: string | null) => void;
}

export const SelectionContext = createContext<SelectionState>({
  selectedEntityId: null,
  setSelectedEntityId: () => {},
  hoveredEntityId: null,
  setHoveredEntityId: () => {}
});

export const useSelectionContext = () => useContext(SelectionContext);
