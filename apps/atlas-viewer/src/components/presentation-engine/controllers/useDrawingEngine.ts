import { useState, useEffect } from 'react';
import { useProjectStore } from '../../../store/useProjectStore';
import type { SheetOption } from './useSheetNavigator';

export const useDrawingEngine = () => {
    const { projectInput } = useProjectStore();
    const [svgContentRecord, setSvgContentRecord] = useState<Record<string, string>>({});
    const [dxfContentRecord, setDxfContentRecord] = useState<Record<string, string>>({});
    const [sheets, setSheets] = useState<SheetOption[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!projectInput) return;

        setIsGenerating(true);
        
        const timer = setTimeout(() => {
            const width = projectInput.width || 20000;
            const length = projectInput.length || 30000;
            const height = projectInput.height || 6000;
            const frameSpacing = projectInput.frameSpacing || 5000;
            const purlinSpacing = projectInput.purlinSpacing || 1000;
            const roofPitch = projectInput.roofPitch || 15;
            const roofType = projectInput.roofType || 'dos-aguas';
            const numberOfBays = Math.max(1, Math.ceil(length / frameSpacing));
            
            const pitchDecimal = roofPitch / 100;
            const ridgeHeight = roofType === 'un-agua' 
                ? height + width * pitchDecimal 
                : height + (width / 2) * pitchDecimal;

            // Global SVG dimensions
            const svgWidth = Math.max(width * 2 + 30000, 80000);
            const svgHeight = length + height + 40000;

            const strokeColor = '#58a6ff';
            const dimColor = '#8b949e';
            const textColor = '#c9d1d9';
            const strokeWidth = 80;
            const textScale = 1000;

            // 1. PLANTA GENERAL (Top Left)
            let framesHtml = '';
            let frameDimsHtml = '';
            for (let i = 0; i <= numberOfBays; i++) {
                const y = i * frameSpacing;
                framesHtml += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
                framesHtml += `<text x="-1500" y="${y + 300}" fill="${textColor}" font-family="monospace" font-size="${textScale}" text-anchor="end">P-${i+1}</text>`;
                
                if (i < numberOfBays) {
                    const nextY = (i + 1) * frameSpacing;
                    frameDimsHtml += `<line x1="-3000" y1="${y}" x2="-3000" y2="${nextY}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />`;
                    frameDimsHtml += `<line x1="-3300" y1="${y}" x2="-2700" y2="${y}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />`;
                    frameDimsHtml += `<line x1="-3300" y1="${nextY}" x2="-2700" y2="${nextY}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />`;
                    frameDimsHtml += `<text x="-3500" y="${(y + nextY) / 2 + 300}" fill="${textColor}" font-family="monospace" font-size="${textScale * 0.8}" text-anchor="end">${frameSpacing}</text>`;
                }
            }

            const plantaGeneral = `
            <g transform="translate(15000, 15000)">
                <text x="0" y="-4000" fill="#fff" font-family="sans-serif" font-size="1800" font-weight="bold">PLANTA GENERAL</text>
                <rect x="0" y="0" width="${width}" height="${length}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth * 1.5}" />
                ${framesHtml}
                ${frameDimsHtml}
                <!-- Overall Width -->
                <line x1="0" y1="-1500" x2="${width}" y2="-1500" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="0" y1="-2000" x2="0" y2="-1000" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="${width}" y1="-2000" x2="${width}" y2="-1000" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <text x="${width / 2}" y="-2200" fill="${textColor}" font-family="monospace" font-size="${textScale}" text-anchor="middle">Luz Libre: ${width} mm</text>
                <!-- Overall Length -->
                <line x1="${width + 2500}" y1="0" x2="${width + 2500}" y2="${length}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="${width + 2000}" y1="0" x2="${width + 3000}" y2="0" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="${width + 2000}" y1="${length}" x2="${width + 3000}" y2="${length}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <text x="${width + 4000}" y="${length / 2}" fill="${textColor}" font-family="monospace" font-size="${textScale}" text-anchor="middle" transform="rotate(90 ${width + 4000} ${length / 2})">Largo Total: ${length} mm</text>
            </g>`;

            // 2. ELEVACIÓN PÓRTICO (Bottom Left)
            const rightColHeight = roofType === 'un-agua' ? ridgeHeight : height;
            let elevRoof = '';
            if (roofType === 'un-agua') {
                elevRoof = `<line x1="0" y1="${-height}" x2="${width}" y2="${-rightColHeight}" stroke="${strokeColor}" stroke-width="${strokeWidth * 2}" />`;
            } else {
                elevRoof = `
                    <line x1="0" y1="${-height}" x2="${width / 2}" y2="${-ridgeHeight}" stroke="${strokeColor}" stroke-width="${strokeWidth * 2}" />
                    <line x1="${width / 2}" y1="${-ridgeHeight}" x2="${width}" y2="${-height}" stroke="${strokeColor}" stroke-width="${strokeWidth * 2}" />
                `;
            }

            const elevacionTopY = 15000 + length + 20000;
            
            const elevacionPortico = `
            <g transform="translate(15000, ${elevacionTopY})">
                <text x="0" y="${-ridgeHeight - 3000}" fill="#fff" font-family="sans-serif" font-size="1800" font-weight="bold">ELEVACIÓN PÓRTICO TIPO (ESC. 1:100)</text>
                <!-- Ground -->
                <line x1="-2000" y1="0" x2="${width + 2000}" y2="0" stroke="${dimColor}" stroke-width="${strokeWidth}" />
                <!-- Columns -->
                <rect x="-200" y="${-height}" width="400" height="${height}" fill="${strokeColor}" />
                <rect x="${width - 200}" y="${-rightColHeight}" width="400" height="${rightColHeight}" fill="${strokeColor}" />
                <!-- Roof -->
                ${elevRoof}
                <!-- Height Dims -->
                <line x1="-1500" y1="0" x2="-1500" y2="${-height}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="-2000" y1="${-height}" x2="-1000" y2="${-height}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <text x="-2000" y="${-height / 2}" fill="${textColor}" font-family="monospace" font-size="${textScale}" text-anchor="end">H: ${height}</text>
                
                <line x1="${width + 1500}" y1="0" x2="${width + 1500}" y2="${-rightColHeight}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="${width + 1000}" y1="${-rightColHeight}" x2="${width + 2000}" y2="${-rightColHeight}" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <text x="${width + 2000}" y="${-rightColHeight / 2}" fill="${textColor}" font-family="monospace" font-size="${textScale}" text-anchor="start">H: ${Math.round(rightColHeight)}</text>
                
                <!-- Width Dim -->
                <line x1="0" y1="1500" x2="${width}" y2="1500" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="0" y1="1000" x2="0" y2="2000" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <line x1="${width}" y1="1000" x2="${width}" y2="2000" stroke="${dimColor}" stroke-width="${strokeWidth / 2}" />
                <text x="${width / 2}" y="2800" fill="${textColor}" font-family="monospace" font-size="${textScale}" text-anchor="middle">Luz Libre: ${width} mm</text>
                
                <!-- Pitch info -->
                <text x="${width / 4}" y="${-height - 1500}" fill="${textColor}" font-family="monospace" font-size="${textScale}">Pendiente: ${roofPitch}%</text>
            </g>`;

            // 3. DETALLE CORREAS (Bottom Right)
            // Draw a diagonal segment to represent the roof beam
            const angle = Math.atan(pitchDecimal);
            const deg = (angle * 180) / Math.PI;
            const numPurlins = 5;
            let purlinsHtml = '';
            for (let i = 0; i < numPurlins; i++) {
                const px = i * purlinSpacing;
                purlinsHtml += `
                    <g transform="translate(${px}, 0)">
                        <rect x="-50" y="-150" width="100" height="150" fill="none" stroke="#fff" stroke-width="20" />
                    </g>
                `;
                if (i < numPurlins - 1) {
                    purlinsHtml += `
                        <line x1="${px}" y1="-300" x2="${px + purlinSpacing}" y2="-300" stroke="${dimColor}" stroke-width="${strokeWidth / 3}" />
                        <line x1="${px}" y1="-350" x2="${px}" y2="-250" stroke="${dimColor}" stroke-width="${strokeWidth / 3}" />
                        <line x1="${px + purlinSpacing}" y1="-350" x2="${px + purlinSpacing}" y2="-250" stroke="${dimColor}" stroke-width="${strokeWidth / 3}" />
                        <text x="${px + purlinSpacing / 2}" y="-450" fill="${textColor}" font-family="monospace" font-size="600" text-anchor="middle">${purlinSpacing}</text>
                    `;
                }
            }

            const detalleCorreasX = width + 25000;
            const detalleCorreas = `
            <g transform="translate(${detalleCorreasX}, ${elevacionTopY - 5000})">
                <text x="0" y="-2000" fill="#fff" font-family="sans-serif" font-size="1800" font-weight="bold">DETALLE DE CORREAS EN TECHO</text>
                <g transform="rotate(${-deg})">
                    <line x1="-1000" y1="0" x2="${purlinSpacing * numPurlins}" y2="0" stroke="${strokeColor}" stroke-width="150" />
                    ${purlinsHtml}
                </g>
                <text x="0" y="2000" fill="${textColor}" font-family="monospace" font-size="1000">Separación típica: ${purlinSpacing} mm</text>
            </g>`;

            const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}">
                ${plantaGeneral}
                ${elevacionPortico}
                ${detalleCorreas}
            </svg>
            `;

            setSvgContentRecord({ 'blueprint-2d': svgString });
            setSheets([{ id: 'blueprint-2d', name: 'Plano de Conjunto (Multivista)' }]);
            setIsGenerating(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [projectInput]);

    return {
        svgContentRecord,
        dxfContentRecord,
        sheets,
        isGenerating
    };
};
