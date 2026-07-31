import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/clerk-react';
import { saveProject as apiSaveProject } from '../services/api';

interface SaveProjectData {
  id?: string;
  name: string;
  description?: string;
  inputData: any;
  entities?: any[];
}

export function useSaveProject() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { getToken } = useAuth();

  const saveProject = async (data: SaveProjectData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      
      const result = await apiSaveProject(data, token);
      
      // Silent Routing: actualizamos la URL sin recargar la página
      if (result.projectId) {
        const newUrl = `/app/projects/${result.projectId}`;
        window.history.replaceState(null, '', newUrl);
      }

      toast.success('Proyecto guardado exitosamente', {
        description: `El proyecto ${data.name} se ha guardado en la base de datos.`
      });
      return result.projectId;

    } catch (err: any) {
      console.error('Error in saveProject:', err);
      setError(err);
      toast.error('Error al guardar el proyecto', {
        description: err.message || 'Ha ocurrido un error inesperado'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveProject,
    isLoading,
    error
  };
}
