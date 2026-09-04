import { jsPDF } from 'jspdf';
import type { LabReport, LabSettings } from '../data/samples';

/**
 * Generates a clean A4 laboratory report suitable for patient sharing/printing.
 * Layout is intentionally conservative: clear hierarchy, readable tables,
 * consistent spacing, and no decorative elements that compete with results.
 */
export const generateReportPdf = (report: LabReport, settings: LabSettings) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 14;
  const CW = W - M * 2;
  const ink = [30, 41, 59] as const;
  const muted = [71, 85, 105] as const;
  const border = [203, 213, 225] as const;
  const accent = [15, 118, 110] as const;
  const light = [248, 250, 252] as const;
  const danger = [185, 28, 28] as const;
  const warning = [180, 83, 9] as const;
  const success = [22, 101, 52] as const;

  const safe = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c] ?? c);
  const fmtDate = (value: unknown) => value ? new Date(String(value)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
  const setText = (color: readonly [number, number, number]) => doc.setTextColor(...color);
  const setFill = (color: readonly [number, number, number]) => doc.setFillColor(...color);
  const setDraw = (color: readonly [number, number, number]) => doc.setDrawColor(...color);

  const drawPageHeader = (pageNo: number) => {
    setFill(accent);
    doc.rect(0, 0, W, 3, 'F');
    setText(ink);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(settings.labName || 'Diagnostic Laboratory', M, 14);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    setText(muted);
    doc.text(settings.tagline || 'Precision Care Through Reliable Testing', M, 19);

    const right = W - M;
    doc.setFontSize(7.5);
    doc.text(settings.address || '', right, 11, { align: 'right' });
    doc.text(`Phone: ${settings.phone || 'N/A'}`, right, 15, { align: 'right' });
    doc.text(`${settings.email || ''}${settings.website ? `  |  ${settings.website}` : ''}`, right, 19, { align: 'right' });
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    setText(accent);
    doc.text(`${settings.isoCertification || ''}${settings.licenseNumber ? `  |  LIC: ${settings.licenseNumber}` : ''}`, right, 23, { align: 'right' });
    setDraw(border);
    doc.setLineWidth(0.35);
    doc.line(M, 27, W - M, 27);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    setText(muted);
    doc.text(`Laboratory Diagnostic Report  •  Page ${pageNo}`, W - M, H - 7, { align: 'right' });
  };

  drawPageHeader(1);

  let y = 34;
  // Report identity / status strip
  setFill(light);
  setDraw(border);
  doc.roundedRect(M, y, CW, 13, 1.5, 1.5, 'FD');
  setText(ink);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`REPORT ${String(report.id).slice(0, 8).toUpperCase()}`, M + 4, y + 5.5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(muted);
  doc.text(`Collected ${fmtDate(report.dateCollected)}`, M + 4, y + 9.5);
  doc.text(`Reported ${fmtDate(report.dateReported)}`, M + 75, y + 9.5);
  const statusColor = report.status === 'Critical' ? danger : report.status === 'Completed' ? success : warning;
  setText(statusColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(String(report.status || 'PENDING').toUpperCase(), W - M - 4, y + 7.5, { align: 'right' });
  y += 19;

  // Patient information — deliberately separated from test results.
  setText(accent);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PATIENT INFORMATION', M, y);
  y += 3;
  setFill([255, 255, 255]);
  setDraw(border);
  doc.roundedRect(M, y, CW, 31, 1.5, 1.5, 'FD');

  const fields: Array<[string, string, number, number]> = [
    ['Patient Name', report.patientName, M + 4, y + 7],
    ['Age / Gender', `${report.age ?? 'N/A'} Yrs / ${report.gender ?? 'N/A'}`, M + 4, y + 15],
    ['Phone', report.phone || 'N/A', M + 4, y + 23],
    ['Report ID', report.id, M + 70, y + 7],
    ['Referred By', report.referredBy || 'Self / Walk-in', M + 70, y + 15],
    ['Email', report.email || 'N/A', M + 70, y + 23],
    ['Collected', fmtDate(report.dateCollected), M + 137, y + 7],
    ['Reported', fmtDate(report.dateReported), M + 137, y + 15],
  ];
  fields.forEach(([label, value, x, yy]) => {
    setText(muted);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(`${label}`, x, yy);
    setText(ink);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.6);
    const max = x < M + 60 ? 60 : x < M + 130 ? 63 : 45;
    doc.text(doc.splitTextToSize(String(value), max), x, yy + 3.5);
  });
  y += 38;

  // Test heading
  setText(accent);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(String(report.testType || 'Laboratory Test').toUpperCase(), M, y);
  y += 4;
  setText(ink);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.text('Results and biological reference intervals', M, y);
  y += 5;

  const columns = [M, M + 62, M + 97, M + 121, M + 165, W - M];
  const headers = ['TEST PARAMETER', 'RESULT', 'UNIT', 'REFERENCE RANGE', 'FLAG'];
  const headerH = 8;
  setFill(ink);
  doc.rect(M, y, CW, headerH, 'F');
  setText([255, 255, 255]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.8);
  headers.forEach((header, i) => doc.text(header, columns[i] + 2.5, y + 5.2));
  y += headerH;

  const rowH = 9;
  report.parameters.forEach((param, index) => {
    if (y > H - 55) {
      doc.addPage();
      drawPageHeader(doc.getNumberOfPages());
      y = 34;
      setFill(ink);
      doc.rect(M, y, CW, headerH, 'F');
      setText([255, 255, 255]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.8);
      headers.forEach((header, i) => doc.text(header, columns[i] + 2.5, y + 5.2));
      y += headerH;
    }

    const status = String(param.status || '').toLowerCase();
    const abnormal = status !== 'normal';
    if (index % 2 === 1) setFill(light); else setFill([255, 255, 255]);
    doc.rect(M, y, CW, rowH, 'F');
    if (abnormal) {
      setFill(status === 'high' || status === 'critical' ? [254, 242, 242] : [255, 247, 237]);
      doc.rect(M, y, CW, rowH, 'F');
      setFill(status === 'high' || status === 'critical' ? danger : warning);
      doc.rect(M, y, 1.2, rowH, 'F');
    }
    setDraw(border);
    doc.setLineWidth(0.18);
    doc.line(M, y + rowH, W - M, y + rowH);
    setText(ink);
    doc.setFont('Helvetica', abnormal ? 'bold' : 'normal');
    doc.setFontSize(7.4);
    doc.text(doc.splitTextToSize(String(param.name), 57), columns[0] + 3, y + 5.7);
    doc.text(doc.splitTextToSize(String(param.value ?? 'N/A'), 31), columns[1] + 3, y + 5.7);
    setText(muted);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(param.unit || '—'), columns[2] + 3, y + 5.7);
    doc.text(doc.splitTextToSize(String(param.refRange || '—'), 40), columns[3] + 3, y + 5.7);
    const flag = String(param.status || 'Normal');
    setText(status === 'high' || status === 'critical' ? danger : status === 'low' ? warning : success);
    doc.setFont('Helvetica', 'bold');
    doc.text(flag.toUpperCase(), columns[4] + 3, y + 5.7);
    y += rowH;
  });

  y += 8;
  if (report.interpretation) {
    const lines = doc.splitTextToSize(report.interpretation, CW - 10);
    const boxH = Math.max(24, 13 + lines.length * 4);
    if (y + boxH > H - 50) {
      doc.addPage();
      drawPageHeader(doc.getNumberOfPages());
      y = 34;
    }
    setFill([248, 250, 252]);
    setDraw(border);
    doc.roundedRect(M, y, CW, boxH, 1.5, 1.5, 'FD');
    setText(accent);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CLINICAL INTERPRETATION / ADVISORY', M + 4, y + 7);
    setText(muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.text(lines, M + 4, y + 13, { lineHeightFactor: 1.35 });
    y += boxH + 8;
  }

  // Signature block is anchored near the bottom only when there is enough room.
  if (y > H - 48) {
    doc.addPage();
    drawPageHeader(doc.getNumberOfPages());
    y = 40;
  }
  setDraw(border);
  doc.setLineWidth(0.35);
  const signatureY = H - 31;
  if (settings.doctors[0]) {
    doc.line(M, signatureY, M + 67, signatureY);
    setText(ink);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(settings.doctors[0].name, M, signatureY + 4);
    setText(muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(settings.doctors[0].qualification, M, signatureY + 8);
    doc.text(settings.doctors[0].designation, M, signatureY + 12);
  }
  if (settings.doctors[1]) {
    const x = W - M - 67;
    doc.line(x, signatureY, W - M, signatureY);
    setText(ink);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(settings.doctors[1].name, x, signatureY + 4);
    setText(muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(settings.doctors[1].qualification, x, signatureY + 8);
    doc.text(settings.doctors[1].designation, x, signatureY + 12);
  }

  setText(muted);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(6);
  doc.text('This report is digitally generated. Results should be interpreted by a qualified healthcare professional.', M, H - 10);
  doc.text(`Report ID: ${report.id}`, M, H - 6.5);

  doc.save(`LabReport_${report.patientName.replace(/\s+/g, '_')}_${report.id}.pdf`);
};
