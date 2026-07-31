export class StyleResolver {
    public resolve(themeClass: string): string {
        // Map theme classes (e.g. 'visible-edge', 'hidden-edge', 'dimension-line')
        // to SVG attributes (stroke, stroke-width, stroke-dasharray)
        switch (themeClass) {
            case 'hidden-edge':
                return `stroke="gray" stroke-width="1" stroke-dasharray="5,5" fill="none"`;
            case 'dimension-line':
                return `stroke="blue" stroke-width="0.5" fill="none"`;
            default: // visible-edge
                return `stroke="black" stroke-width="2" fill="none"`;
        }
    }
}
