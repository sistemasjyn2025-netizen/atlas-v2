import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

interface SaveProjectData {
  id?: string;
  name: string;
  description?: string;
  inputData: any;
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

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: al guardar el proyecto`);
      }

      const result = await response.json();
      
      // Silent Routing: actualizamos la URL sin recargar la página
      if (result.projectId) {
        const newUrl = `/app/projects/${result.projectId}`;
        window.history.replaceState(null, '', newUrl);
      }

      toast.success('Proyecto guardado exitosamente');
      return result.projectId;

    } catch (err: any) {
      console.error('Error in saveProject:', err);
      setError(err);
      toast.error('Error al guardar el proyecto');
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
