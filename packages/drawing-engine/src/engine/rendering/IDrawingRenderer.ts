import { DrawingPackage } from '../../domain/DrawingPackage';

export interface IDrawingRenderer<TOutput> {
    render(drawingPackage: DrawingPackage): Promise<TOutput>;
}
