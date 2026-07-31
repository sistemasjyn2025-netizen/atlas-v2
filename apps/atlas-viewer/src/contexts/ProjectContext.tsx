import { createContext, useContext } from 'react';

export interface ProjectState {
  projectInput: any;
  updateProjectInput: (partial: any) => void;
}

export const ProjectContext = createContext<ProjectState>({
  projectInput: null,
  updateProjectInput: () => {}
});

export const useProjectContext = () => useContext(ProjectContext);
