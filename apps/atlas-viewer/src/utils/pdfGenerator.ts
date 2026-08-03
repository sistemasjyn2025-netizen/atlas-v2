import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettingsStore } from '../store/useSettingsStore';

// Linear weights in kg/m based on profile types
const getWeightFactors = (structureType: string): Record<string, number> => {
  const isTruss = structureType === 'reticulado';
  return {
    'Column': isTruss ? 25 : 35, // Lighter if truss (just an estimation for feedback)
    'Beam': isTruss ? 20 : 35,
    'Purlin': 5, // 5 kg/m for C-Profile
    'Bracing': 2 // 2 kg/m for Steel Rods
  };
};

export const generateBOM = (entities: any[], projectInput: any) => {
  const doc = new jsPDF();
  const profile = useSettingsStore.getState().companyProfile;

  // Header
  if (profile.companyLogoUrl) {
    try {
      doc.addImage(profile.companyLogoUrl, 'PNG', 14, 15, 30, 15);
    } catch(e) {
      console.warn("Could not add image, maybe CORS or format issue.", e);
    }
  }

  const companyName = profile.companyName || 'ATLAS';
  
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text(companyName, profile.companyLogoUrl ? 50 : 14, 22);
  
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('Presupuesto Oficial y Lista de Materiales', profile.companyLogoUrl ? 50 : 14, 32);

  if (profile.contactInfo) {
    doc.setFontSize(10);
    doc.text(profile.contactInfo, 14, 40);
  }

  // Project Parameters
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const w = (projectInput.width / 1000).toFixed(2);
  const l = (projectInput.length / 1000).toFixed(2);
  const h = (projectInput.height / 1000).toFixed(2);
  const pitch = projectInput.roofPitch || 15;
  const frameSpacing = ((projectInput.frameSpacing || 5000) / 1000).toFixed(2);
  const purlinSpacing = ((projectInput.purlinSpacing || 1000) / 1000).toFixed(2);
  const roofTypeStr = projectInput.roofType === 'un-agua' ? 'A Un Agua' : 'A Dos Aguas';
  const structureTypeStr = projectInput.structureType === 'reticulado' ? 'Reticulado (Celosía)' : 'Alma Llena';
  
  doc.text(`Proyecto: ${projectInput.projectName || 'Galpón Industrial'}`, 14, 45);
  doc.text(`Dimensiones: ${w}m (Luz Libre) x ${l}m (Largo) x ${h}m (Altura)`, 14, 52);
  doc.text(`Tipo de Techo: ${roofTypeStr} (Pendiente: ${pitch}%)`, 14, 59);
  doc.text(`Estructura Principal: ${structureTypeStr} a ${frameSpacing}m`, 14, 66);
  doc.text(`Separación de Correas: ${purlinSpacing}m`, 14, 73);

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
  
  const pricePerKg = projectInput.pricePerKg || 0;
  const WEIGHT_FACTORS = getWeightFactors(projectInput.structureType || 'alma-llena');

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
      totalRowWeight.toFixed(2),
      `$${(totalRowWeight * pricePerKg).toFixed(2)}`
    ]);
  });

  // Draw Table
  autoTable(doc, {
    startY: 82,
    head: [['Ítem', 'Descripción', 'Longitud (m)', 'Cantidad', 'Peso Unit. (kg)', 'Peso Total (kg)', 'Costo (USD)']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [88, 166, 255] as any }, // atlas blue
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });

  // Total Footer
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Peso Estructural Total: ${(totalWeight / 1000).toFixed(2)} Toneladas`, 14, finalY + 15);
  doc.setTextColor(63, 185, 80); // green
  doc.text(`Presupuesto Total Estructural: $${(totalWeight * pricePerKg).toFixed(2)} USD`, 14, finalY + 25);

  doc.save('reporte-atlas.pdf');
};
