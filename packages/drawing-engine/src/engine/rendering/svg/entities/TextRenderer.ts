import { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
import { IEntityRenderer } from './IEntityRenderer';
import { TextLayout } from '../TextLayout';

export class TextRenderer implements IEntityRenderer<DrawingEntity> {
    private textLayout = new TextLayout();

    public render(entity: DrawingEntity, svgAttributes: string): string {
        // We'd extract the text content and position from the entity.
        const textContent = 'Sample Text';
        return `<text x="0" y="0" font-family="Arial" font-size="12" ${svgAttributes}>${textContent}</text>`;
    }
}
