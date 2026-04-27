import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportRankingToPDF = (championshipName: string, data: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(11, 12, 14);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(250, 204, 21); // #FACC15
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ARENA PRO', 14, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`TABELA DE CLASSIFICAÇÃO: ${championshipName.toUpperCase()}`, 14, 33);
  
  doc.setFontSize(8);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 160, 33);

  // Table
  const tableData = data.map((item, index) => [
    index + 1,
    item.teamName,
    item.points,
    item.played,
    item.victories,
    item.draws,
    item.losses,
    item.goalsFor,
    item.goalsAgainst,
    item.goalDifference
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['POS', 'EQUIPE', 'PTS', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { fontStyle: 'bold' },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { halign: 'center' },
      9: { halign: 'center' },
    }
  });

  doc.save(`ranking-${championshipName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

export const exportScorersToPDF = (championshipName: string, data: any[]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(11, 12, 14);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(250, 204, 21);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ARENA PRO', 14, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`ARTILHARIA: ${championshipName.toUpperCase()}`, 14, 33);
    
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 160, 33);
  
    // Table
    const tableData = data.map((item, index) => [
      index + 1,
      item.name,
      item.teamName || 'N/A',
      item.goals
    ]);
  
    autoTable(doc, {
      startY: 50,
      head: [['POS', 'ATLETA', 'EQUIPE', 'GOLS']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { fontStyle: 'bold' },
        3: { halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] },
      }
    });
  
    doc.save(`artilharia-${championshipName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };
