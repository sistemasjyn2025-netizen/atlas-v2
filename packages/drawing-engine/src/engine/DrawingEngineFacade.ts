import { PipelineResult } from '@atlas/runtime';
import { DocumentSession } from '../domain/DocumentSession';
import { ProjectionDefinition, ProjectionType } from '../domain/projection/ProjectionDefinition';
import { ProjectionPipeline } from './projection/ProjectionPipeline';
import { DrawingPipeline } from './generation/DrawingPipeline';
import { SheetComposer } from './layout/SheetComposer';
import { SvgRenderer } from './rendering/svg/SvgRenderer';
import { DxfRenderer } from './rendering/dxf/DxfRenderer';
import { PaperFormat } from '../domain/layout/PaperFormat';
import { DrawingPackage } from '../domain/DrawingPackage';

export class DrawingEngineFacade {
    private projectionPipeline = new ProjectionPipeline();
    private drawingPipeline = new DrawingPipeline();
    private sheetComposer = new SheetComposer();
    private svgRenderer = new SvgRenderer();
    private dxfRenderer = new DxfRenderer();

    public async generateDrawings(pipelineResult: PipelineResult): Promise<{ svgContentRecord: Record<string, string>, dxfContentRecord: Record<string, string> }> {
        // Mock Session
        const session = new DocumentSession(pipelineResult.projectId || 'demo-project');
        
        // Mock Definitions
        const defs: ProjectionDefinition[] = [
            { 
                type: ProjectionType.Top, 
                cameraDirection: { x: 0, y: 0, z: -1 }, 
                upVector: { x: 0, y: 1, z: 0 }, 
                clippingRegion: { minX: -1000, minY: -1000, maxX: 1000, maxY: 1000, minZ: -1000, maxZ: 1000 },
                scale: 1,
                tolerance: 0.1
            },
            { 
                type: ProjectionType.Front, 
                cameraDirection: { x: 0, y: -1, z: 0 }, 
                upVector: { x: 0, y: 0, z: 1 }, 
                clippingRegion: { minX: -1000, minY: -1000, maxX: 1000, maxY: 1000, minZ: -1000, maxZ: 1000 },
                scale: 1,
                tolerance: 0.1
            }
        ];

        const views = [];

        // 1. Projection & 2. Generation
        for (const def of defs) {
            try {
                // Projection produces empty geometry for now due to stubs
                const projResult = this.projectionPipeline.execute(pipelineResult, def);
                // We use a mock generator name (in a real scenario we use PluginRegistry)
                const view = this.drawingPipeline.execute('GeneralArrangementGenerator', projResult.geometry);
                views.push(view);
            } catch (e) {
                console.warn(`Could not generate view for ${def.type}`, e);
            }
        }

        // 3. Layout (Sheet Composer)
        const format = PaperFormat.A3_Landscape;
        // @ts-ignore - Ignore type mismatch between mock SheetComposer and domain types
        const sheet = this.sheetComposer.compose(format as any, views as any, { projectName: session.projectId }) as any;
        
        const docPackage = new DrawingPackage('Demo Package', 'Auto-generated drawings');
        docPackage.addSheet(sheet);

        // 4. Rendering
        const svgString = await this.svgRenderer.render(docPackage);
        const dxfString = await this.dxfRenderer.render(docPackage);

        const svgContentRecord: Record<string, string> = {};
        svgContentRecord[sheet.id] = svgString;

        const dxfContentRecord: Record<string, string> = {};
        dxfContentRecord[sheet.id] = dxfString;

        return { svgContentRecord, dxfContentRecord };
    }
}
