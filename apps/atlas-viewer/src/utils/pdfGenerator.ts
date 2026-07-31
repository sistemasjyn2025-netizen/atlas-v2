import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Linear weights in kg/m based on profile types
const WEIGHT_FACTORS: Record<string, number> = {
  'Column': 35, // 35 kg/m for W-Profile
  'Beam': 35,
  'Purlin': 5, // 5 kg/m for C-Profile
  'Bracing': 2 // 2 kg/m for Steel Rods
};

export const generateBOM = (entities: any[], projectInput: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('ATLAS', 14, 22);
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('Lista de Materiales y Estimación Estructural', 14, 32);

  // Project Parameters
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const w = (projectInput.width / 1000).toFixed(2);
  const l = (projectInput.length / 1000).toFixed(2);
  const h = (projectInput.height / 1000).toFixed(2);
  const slope = (projectInput.roofSlope * 100).toFixed(1);
  const spacing = (projectInput.baySpacing / 1000).toFixed(2);
  
  doc.text(`Proyecto: ${projectInput.projectName || 'Galpón Industrial'}`, 14, 45);
  doc.text(`Dimensiones: ${w}m (Ancho) x ${l}m (Largo) x ${h}m (Altura)`, 14, 52);
  doc.text(`Pendiente de Techo: ${slope}%`, 14, 59);
  doc.text(`Separación entre Pórticos: ${spacing}m`, 14, 66);

  // Group Entities
  const groups: Record<string, any> = {};
  
  entities.forEach(e => {
    // Round length to 2 decimal places to avoid floating point mismatch
    const lenM = (e.length / 1000).toFixed(2);
    const key = `${e.type}_${e.material}_${lenM}`;
    
    if (!groups[key]) {
      groups[key] = {
        type: e.type,
        material: e.material,
        lengthM: parseFloat(lenM),
        quantity: 0,
        name: e.type // Generalize name
      };
    }
    groups[key].quantity += 1;
  });

  // Table Data
  const tableRows: any[] = [];
  let totalWeight = 0;
  
  let itemIndex = 1;
  Object.values(groups).forEach(group => {
    const weightPerM = WEIGHT_FACTORS[group.type] || 10;
    const unitWeight = group.lengthM * weightPerM;
    const totalRowWeight = unitWeight * group.quantity;
    
    totalWeight += totalRowWeight;
    
    tableRows.push([
      itemIndex++,
      `${group.type} - ${group.material}`,
      group.lengthM.toFixed(2),
      group.quantity,
      unitWeight.toFixed(2),
      totalRowWeight.toFixed(2)
    ]);
  });

  // Draw Table
  autoTable(doc, {
    startY: 75,
    head: [['Ítem', 'Descripción', 'Longitud (m)', 'Cantidad', 'Peso Unit. (kg)', 'Peso Total (kg)']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [88, 166, 255] as any }, // atlas blue
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });

  // Total Footer
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Peso Estructural Total: ${(totalWeight / 1000).toFixed(2)} Toneladas`, 14, finalY + 15);

  doc.save('reporte-atlas.pdf');
};
