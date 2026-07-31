import { useState } from 'react';
import { usePipelineContext } from '../contexts/PipelineContext';
import { PdfDocumentExporter } from '@atlas/deliverables-engine'; // Assuming alias exists

export const useDeliverablesExport = () => {
  const { pipelineResult } = usePipelineContext();
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = async () => {
    if (!pipelineResult || !pipelineResult.quote) {
      alert('No hay cotización generada para exportar.');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const exporter = new PdfDocumentExporter(); // Needs DeliverablesService in real implementation
      const files = await exporter.export(pipelineResult);
      
      if (files && files.length > 0) {
        const file = files[0];
        const blobToDownload = new Blob([file.content as any], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blobToDownload);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${file.name}.pdf`;
        a.click();
        
        // El Hook de React hace la recolección de basura correctamente
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (e) {
      console.error(e);
      alert('Error exportando PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPdf, isExporting };
};
