import Drawing from 'dxf-writer';

export const generateDXF = (entities: any[]) => {
  const d = new Drawing();
  d.setUnits('Millimeters');
  d.drawText(0, -500, 200, 0, 'Plano de Placas de Anclaje - ATLASv2');

  const columns = entities.filter(e => e.type === 'Column' && e.position);
  
  const plateWidth = 500; // 500mm wide
  const plateDepth = 300; // 300mm deep

  columns.forEach((col) => {
    // Map 3D coordinate system to 2D DXF:
    // 3D X -> DXF X
    // 3D Z -> DXF Y
    const x = col.position.x;
    const y = col.position.z;

    const x1 = x - plateWidth / 2;
    const y1 = y - plateDepth / 2;
    const x2 = x + plateWidth / 2;
    const y2 = y + plateDepth / 2;

    // Draw base plate rectangle
    d.drawLine(x1, y1, x2, y1);
    d.drawLine(x2, y1, x2, y2);
    d.drawLine(x2, y2, x1, y2);
    d.drawLine(x1, y2, x1, y1);
    
    // Draw crosshair center
    d.drawLine(x - 50, y, x + 50, y);
    d.drawLine(x, y - 50, x, y + 50);

    // Label
    d.drawText(x, y + plateDepth / 2 + 100, 80, 0, col.name || col.id);
  });

  return d.toDxfString();
};
