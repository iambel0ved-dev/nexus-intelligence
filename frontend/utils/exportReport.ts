import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates a professional PDF report of the current market intelligence.
 */
export const downloadIntelligenceReport = (plans: any[], activeCompany: string) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // 1. Branding Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Nexus Blue
  doc.text("NEXUS INTELLIGENCE", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("AUTONOMOUS MARKET SURVEILLANCE REPORT", 14, 28);
  doc.text(`DATE: ${timestamp}`, 14, 34);
  doc.text(`PROVIDER SCOPE: ${activeCompany.toUpperCase()}`, 14, 40);

  // 2. Data Transformation
  const tableRows = plans.map(plan => [
    plan.companies?.name || "Global Provider",
    plan.plan_name,
    `$${plan.price_value}`,
    "1M Tokens",
    new Date(plan.updated_at).toLocaleDateString()
  ]);

  // 3. Table Layout
  autoTable(doc, {
    startY: 48,
    head: [['Provider', 'Plan/Model', 'Price (USD)', 'Unit', 'Last Verified']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
        fillColor: [15, 23, 42], // Slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 45 },
  });

  // 4. Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Confidential Market Intelligence - Page ${i} of ${pageCount}`, 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    );
  }

  // 5. Trigger Download
  const fileName = `Nexus_Intel_${activeCompany.toLowerCase().replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};