import { jsPDF } from 'jspdf';
import type { LabReport, LabSettings } from '../data/samples';

export const generateReportPdf = (report: LabReport, settings: LabSettings) => {
  // Create A4 PDF: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // 1. Draw Lab Header Brand
  doc.setFillColor(6, 96, 137); // Deep teal (#066089)
  doc.rect(margin, margin, contentWidth, 2, 'F');

  // Lab Name & Slogan
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(settings.labName, margin, margin + 10);
  
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(settings.tagline, margin, margin + 14);

  // Lab Contact Details (Right Aligned)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(settings.address, pageWidth - margin, margin + 8, { align: 'right' });
  doc.text(`Phone: ${settings.phone}`, pageWidth - margin, margin + 12, { align: 'right' });
  doc.text(`Email: ${settings.email} | Web: ${settings.website}`, pageWidth - margin, margin + 16, { align: 'right' });

  // Subheader Info (ISO / NABL / Lic)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 96, 137);
  doc.text(`${settings.isoCertification} | LIC: ${settings.licenseNumber}`, margin, margin + 20);

  // Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 22, pageWidth - margin, margin + 22);

  // 2. Patient Demographics Card Box
  const patientCardY = margin + 25;
  const cardHeight = 28;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin, patientCardY, contentWidth, cardHeight, 'FD');

  // Draw Patient Details inside Box
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);

  const col1X = margin + 4;
  const col2X = margin + 60;
  const col3X = margin + 120;

  // Row 1
  doc.setFont('Helvetica', 'bold');
  doc.text("Patient Name:", col1X, patientCardY + 6);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(report.patientName, col1X + 22, patientCardY + 6);
  
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Report ID:", col2X, patientCardY + 6);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.id, col2X + 16, patientCardY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Date Collected:", col3X, patientCardY + 6);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(report.dateCollected).toLocaleString(), col3X + 24, patientCardY + 6);

  // Row 2
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Age / Gender:", col1X, patientCardY + 14);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.age} Yrs / ${report.gender}`, col1X + 22, patientCardY + 14);

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Referred By:", col2X, patientCardY + 14);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.referredBy, col2X + 20, patientCardY + 14);

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Date Reported:", col3X, patientCardY + 14);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(report.dateReported).toLocaleString(), col3X + 24, patientCardY + 14);

  // Row 3
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Phone:", col1X, patientCardY + 22);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.phone, col1X + 22, patientCardY + 22);

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Email:", col2X, patientCardY + 22);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.email || "N/A", col2X + 20, patientCardY + 22);

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.text("Status:", col3X, patientCardY + 22);
  doc.setFont('Helvetica', 'bold');
  if (report.status === 'Critical') {
    doc.setTextColor(239, 68, 68); // Red
  } else if (report.status === 'Completed') {
    doc.setTextColor(16, 185, 129); // Green
  } else {
    doc.setTextColor(245, 158, 11); // Amber
  }
  doc.text(report.status.toUpperCase(), col3X + 24, patientCardY + 22);

  // 3. Simulated Barcode (Right edge)
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  const barcodeX = pageWidth - margin - 35;
  const barcodeY = patientCardY + 16;
  // Draw some vertical lines to simulate barcode
  doc.line(barcodeX, barcodeY, barcodeX, barcodeY + 5);
  doc.line(barcodeX + 1, barcodeY, barcodeX + 1, barcodeY + 5);
  doc.line(barcodeX + 3, barcodeY, barcodeX + 3, barcodeY + 5);
  doc.line(barcodeX + 4, barcodeY, barcodeX + 4, barcodeY + 5);
  doc.line(barcodeX + 5, barcodeY, barcodeX + 5, barcodeY + 5);
  doc.line(barcodeX + 7, barcodeY, barcodeX + 7, barcodeY + 5);
  doc.line(barcodeX + 9, barcodeY, barcodeX + 9, barcodeY + 5);
  doc.line(barcodeX + 11, barcodeY, barcodeX + 11, barcodeY + 5);
  doc.line(barcodeX + 12, barcodeY, barcodeX + 12, barcodeY + 5);
  doc.line(barcodeX + 14, barcodeY, barcodeX + 14, barcodeY + 5);
  doc.line(barcodeX + 16, barcodeY, barcodeX + 16, barcodeY + 5);
  doc.line(barcodeX + 17, barcodeY, barcodeX + 17, barcodeY + 5);
  doc.line(barcodeX + 18, barcodeY, barcodeX + 18, barcodeY + 5);
  
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(report.id, barcodeX + 4, barcodeY + 8);

  // 4. Diagnostic Report Title
  const titleY = patientCardY + 37;
  doc.setTextColor(6, 96, 137);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`DEPARTMENT OF BIOCHEMISTRY & PATHOLOGY`, margin, titleY);
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TEST REPORT: ${report.testType.toUpperCase()}`, margin, titleY + 6);

  // 5. Test Parameters Table Header
  const tableY = titleY + 12;
  const rowHeight = 7.5;
  
  doc.setFillColor(6, 96, 137);
  doc.rect(margin, tableY, contentWidth, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  
  const colNameX = margin + 3;
  const colValueX = margin + 70;
  const colUnitX = margin + 100;
  const colRefX = margin + 130;
  const colFlagX = margin + 168;

  doc.text("TEST PARAMETER", colNameX, tableY + 5);
  doc.text("OBSERVED VALUE", colValueX, tableY + 5);
  doc.text("UNIT", colUnitX, tableY + 5);
  doc.text("BIOLOGICAL REF RANGE", colRefX, tableY + 5);
  doc.text("FLAG", colFlagX, tableY + 5);

  // 6. Loop & Render Test Parameter Rows
  let currentY = tableY + 7;
  doc.setLineWidth(0.15);
  doc.setDrawColor(226, 232, 240);

  report.parameters.forEach((param) => {
    // Determine row background shading or highlight
    const isAbnormal = param.status !== 'Normal';
    
    if (isAbnormal) {
      doc.setFillColor(254, 242, 242); // very light red
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
    }

    // Row borders
    doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

    // Write parameters text
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    
    if (isAbnormal) {
      doc.setFont('Helvetica', 'bold');
      if (param.status === 'High') {
        doc.setTextColor(220, 38, 38); // Red-600
      } else if (param.status === 'Low') {
        doc.setTextColor(217, 119, 6); // Amber-600
      } else {
        doc.setTextColor(220, 38, 38);
      }
    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
    }

    doc.text(param.name, colNameX, currentY + 5);
    doc.text(param.value, colValueX, currentY + 5);
    doc.text(param.unit || "-", colUnitX, currentY + 5);
    doc.text(param.refRange, colRefX, currentY + 5);
    doc.text(param.status === 'Normal' ? "Normal" : param.status.toUpperCase(), colFlagX, currentY + 5);

    currentY += rowHeight;
  });

  // 7. Clinical Interpretation Box
  currentY += 4;
  if (report.interpretation) {
    const interpretationHeight = 30;
    
    // Boundary check for page height
    if (currentY + interpretationHeight + 40 > pageHeight) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, interpretationHeight, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 96, 137);
    doc.text("CLINICAL INTERPRETATION / ADVISORY", margin + 3, currentY + 5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    
    // Auto-wrap interpretation text
    const textLines = doc.splitTextToSize(report.interpretation, contentWidth - 8);
    doc.text(textLines, margin + 4, currentY + 10);

    currentY += interpretationHeight;
  }

  // 8. Footer & Doctor Signatures
  const footerY = pageHeight - margin - 30;
  
  // Signature line details
  doc.setDrawColor(148, 163, 184); // slate-300
  doc.setLineWidth(0.3);

  // Left Signatory (Doctor 1)
  if (settings.doctors[0]) {
    doc.line(margin + 5, footerY, margin + 70, footerY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(settings.doctors[0].name, margin + 5, footerY + 4);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(settings.doctors[0].qualification, margin + 5, footerY + 8);
    doc.text(settings.doctors[0].designation, margin + 5, footerY + 11);
  }

  // Right Signatory (Doctor 2)
  if (settings.doctors[1]) {
    const doc2X = pageWidth - margin - 70;
    doc.line(doc2X, footerY, pageWidth - margin - 5, footerY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(settings.doctors[1].name, doc2X, footerY + 4);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(settings.doctors[1].qualification, doc2X, footerY + 8);
    doc.text(settings.doctors[1].designation, doc2X, footerY + 11);
  }

  // Final Accreditation Disclaimer
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const endLineY = pageHeight - margin - 10;
  doc.text("--- End of Laboratory Diagnostic Report ---", pageWidth / 2, endLineY, { align: 'center' });
  doc.text("This report is generated securely online. Signature stamps are electronic and authorized by apex laboratory administrators.", pageWidth / 2, endLineY + 3, { align: 'center' });

  // Save the PDF locally in the browser
  doc.save(`LabReport_${report.patientName.replace(/\s+/g, '_')}_${report.id}.pdf`);
};
