import { jsPDF } from 'jspdf';
import type { LabReport, LabSettings } from '../data/samples';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const TOP_CONTENT = 38;
const BOTTOM_CONTENT = 42;
const TOTAL_PAGES = '{total_pages_count_string}';

type RGB = readonly [number, number, number];

/**
 * Generates the legacy/local laboratory report PDF.
 * The layout intentionally follows a clinical LIS document structure:
 * stable header, patient demographics, result table, interpretation and
 * authorization footer. All content is wrapped before it is drawn so long
 * patient names, addresses, IDs and parameter names cannot overlap.
 */
export const generateReportPdf = (report: LabReport, settings: LabSettings) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const colors = {
    ink: [15, 23, 42] as RGB,
    body: [51, 65, 85] as RGB,
    muted: [100, 116, 139] as RGB,
    border: [203, 213, 225] as RGB,
    panel: [248, 250, 252] as RGB,
    white: [255, 255, 255] as RGB,
    accent: [3, 105, 161] as RGB,
    accentLight: [239, 246, 255] as RGB,
    high: [185, 28, 28] as RGB,
    highBg: [254, 242, 242] as RGB,
    low: [180, 83, 9] as RGB,
    lowBg: [255, 247, 237] as RGB,
    normal: [22, 101, 52] as RGB,
    normalBg: [240, 253, 244] as RGB,
  };

  const setText = (color: RGB) => doc.setTextColor(...color);
  const setFill = (color: RGB) => doc.setFillColor(...color);
  const setDraw = (color: RGB) => doc.setDrawColor(...color);
  const clean = (value: unknown, fallback = '—') => {
    const text = String(value ?? '').trim();
    return text || fallback;
  };

  const formatDate = (value: unknown) => {
    if (!value) return '—';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reportNumber = clean(
    (report as LabReport & { reportNumber?: string }).reportNumber,
    String(report.id).startsWith('REP-') ? report.id : `LAB-${String(report.id).slice(0, 8).toUpperCase()}`,
  );

  const status = clean(report.status, 'Draft').toUpperCase();
  const statusColor = status === 'CRITICAL' ? colors.high : status === 'COMPLETED' ? colors.normal : colors.low;
  const statusBg = status === 'CRITICAL' ? colors.highBg : status === 'COMPLETED' ? colors.normalBg : colors.lowBg;

  const drawFooter = () => {
    const y = PAGE_HEIGHT - 15;
    setDraw(colors.border);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y - 4, PAGE_WIDTH - MARGIN, y - 4);
    setText(colors.muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.text(`Report No: ${reportNumber}`, MARGIN, y);
    doc.text(`Generated ${formatDate(new Date())}`, PAGE_WIDTH / 2, y, { align: 'center' });
    doc.text(`Page ${doc.getNumberOfPages()} of ${TOTAL_PAGES}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
  };

  const drawHeader = () => {
    setFill(colors.accent);
    doc.rect(0, 0, PAGE_WIDTH, 3, 'F');

    setText(colors.ink);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(clean(settings.labName, 'Diagnostic Laboratory'), MARGIN, 13);

    setText(colors.accent);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text('LABORATORY DIAGNOSTIC REPORT', PAGE_WIDTH - MARGIN, 10, { align: 'right' });

    setText(colors.muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.2);
    const tagline = doc.splitTextToSize(clean(settings.tagline, ''), 100);
    doc.text(tagline, MARGIN, 18);

    const contactParts = [
      clean(settings.address, ''),
      settings.phone ? `Phone: ${settings.phone}` : '',
      [settings.email, settings.website].filter(Boolean).join('  |  '),
    ].filter(Boolean);
    let contactY = 11;
    contactParts.forEach((part) => {
      const lines = doc.splitTextToSize(part, 78);
      doc.text(lines, PAGE_WIDTH - MARGIN, contactY, { align: 'right' });
      contactY += Math.max(3.5, lines.length * 3.2);
    });

    const accreditation = [settings.isoCertification, settings.licenseNumber ? `LIC: ${settings.licenseNumber}` : '']
      .filter(Boolean)
      .join('  |  ');
    if (accreditation) {
      setText(colors.accent);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.text(doc.splitTextToSize(accreditation, CONTENT_WIDTH), MARGIN, 29);
    }

    setDraw(colors.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 33, PAGE_WIDTH - MARGIN, 33);
  };

  const drawPatientField = (label: string, value: unknown, x: number, y: number, width: number) => {
    setText(colors.muted);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(label.toUpperCase(), x, y);

    setText(colors.ink);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.6);
    const lines = doc.splitTextToSize(clean(value), width);
    doc.text(lines, x, y + 3.6);
  };

  const drawPatientCard = () => {
    const y = TOP_CONTENT;
    const height = 39;
    setFill(colors.panel);
    setDraw(colors.border);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, height, 1.5, 1.5, 'FD');

    setText(colors.accent);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PATIENT & REPORT INFORMATION', MARGIN + 4, y + 6);

    const left = MARGIN + 4;
    const middle = MARGIN + 68;
    const right = MARGIN + 132;
    drawPatientField('Patient Name', report.patientName, left, y + 12, 58);
    drawPatientField('Age / Gender', `${clean(report.age)} Yrs / ${clean(report.gender)}`, left, y + 22, 58);
    drawPatientField('Phone', report.phone, left, y + 32, 58);

    drawPatientField('Report No.', reportNumber, middle, y + 12, 59);
    drawPatientField('Referred By', report.referredBy, middle, y + 22, 59);
    drawPatientField('Email', report.email, middle, y + 32, 59);

    drawPatientField('Collected', formatDate(report.dateCollected), right, y + 12, 43);
    drawPatientField('Reported', formatDate(report.dateReported), right, y + 22, 43);

    setFill(statusBg);
    doc.roundedRect(right, y + 27, 43, 8, 1.5, 1.5, 'F');
    setText(statusColor);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(status, right + 21.5, y + 32.2, { align: 'center' });
  };

  const drawSectionTitle = (title: string, subtitle?: string) => {
    setText(colors.accent);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(title.toUpperCase(), MARGIN, cursorY);
    cursorY += 4;
    if (subtitle) {
      setText(colors.muted);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text(subtitle, MARGIN, cursorY);
      cursorY += 4;
    }
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height <= PAGE_HEIGHT - BOTTOM_CONTENT) return;
    doc.addPage();
    drawHeader();
    cursorY = TOP_CONTENT;
  };

  let cursorY = TOP_CONTENT + 47;
  drawHeader();
  drawPatientCard();

  drawSectionTitle(
    clean(report.testType, 'Laboratory Test'),
    'Results are reported with the biological reference interval configured for the test.',
  );

  const tableX = MARGIN;
  const tableWidth = CONTENT_WIDTH;
  const columns = [tableX, tableX + 61, tableX + 94, tableX + 119, tableX + 164, tableX + tableWidth];
  const headerHeight = 9;

  const drawTableHeader = () => {
    setFill(colors.ink);
    doc.rect(tableX, cursorY, tableWidth, headerHeight, 'F');
    setText(colors.white);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.6);
    ['TEST PARAMETER', 'RESULT', 'UNIT', 'REFERENCE RANGE', 'FLAG'].forEach((label, index) => {
      doc.text(label, columns[index] + 2.5, cursorY + 5.8);
    });
    cursorY += headerHeight;
  };

  drawTableHeader();

  report.parameters.forEach((parameter, index) => {
    const flag = clean(parameter.status, 'Normal');
    const flagKey = flag.toLowerCase();
    const abnormal = flagKey !== 'normal';
    const nameLines = doc.splitTextToSize(clean(parameter.name), 56);
    const valueLines = doc.splitTextToSize(clean(parameter.value), 29);
    const unitLines = doc.splitTextToSize(clean(parameter.unit), 20);
    const refLines = doc.splitTextToSize(clean(parameter.refRange), 40);
    const lineCount = Math.max(nameLines.length, valueLines.length, unitLines.length, refLines.length, 1);
    const rowHeight = Math.max(9, 4.5 + lineCount * 3.8);

    if (cursorY + rowHeight > PAGE_HEIGHT - BOTTOM_CONTENT) {
      doc.addPage();
      drawHeader();
      cursorY = TOP_CONTENT;
      drawTableHeader();
    }

    setFill(index % 2 ? colors.panel : colors.white);
    doc.rect(tableX, cursorY, tableWidth, rowHeight, 'F');

    if (abnormal) {
      setFill(flagKey === 'high' || flagKey === 'critical' ? colors.highBg : colors.lowBg);
      doc.rect(tableX, cursorY, tableWidth, rowHeight, 'F');
      setFill(flagKey === 'high' || flagKey === 'critical' ? colors.high : colors.low);
      doc.rect(tableX, cursorY, 1.1, rowHeight, 'F');
    }

    setDraw(colors.border);
    doc.setLineWidth(0.18);
    doc.line(tableX, cursorY + rowHeight, tableX + tableWidth, cursorY + rowHeight);

    setText(abnormal ? (flagKey === 'high' || flagKey === 'critical' ? colors.high : colors.low) : colors.ink);
    doc.setFont('Helvetica', abnormal ? 'bold' : 'normal');
    doc.setFontSize(7.1);
    doc.text(nameLines, columns[0] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });

    setText(colors.ink);
    doc.setFont('Helvetica', 'bold');
    doc.text(valueLines, columns[1] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });

    setText(colors.body);
    doc.setFont('Helvetica', 'normal');
    doc.text(unitLines, columns[2] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });
    doc.text(refLines, columns[3] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });

    const flagColor = flagKey === 'high' || flagKey === 'critical' ? colors.high : flagKey === 'low' ? colors.low : colors.normal;
    setText(flagColor);
    doc.setFont('Helvetica', 'bold');
    doc.text(flag.toUpperCase(), columns[4] + 3, cursorY + 5.5);

    cursorY += rowHeight;
  });

  cursorY += 8;
  if (report.interpretation) {
    const lines = doc.splitTextToSize(report.interpretation, CONTENT_WIDTH - 10);
    const boxHeight = Math.max(24, 12 + lines.length * 4);
    ensureSpace(boxHeight + 2);

    setFill(colors.accentLight);
    setDraw([191, 219, 254]);
    doc.roundedRect(MARGIN, cursorY, CONTENT_WIDTH, boxHeight, 1.5, 1.5, 'FD');
    setText(colors.accent);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CLINICAL INTERPRETATION / ADVISORY', MARGIN + 4, cursorY + 7);
    setText(colors.body);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.text(lines, MARGIN + 4, cursorY + 13, { lineHeightFactor: 1.35 });
    cursorY += boxHeight + 7;
  }

  // Keep authorization on the final page and never overlay report content.
  const signatureY = PAGE_HEIGHT - 43;
  if (cursorY > signatureY - 7) {
    doc.addPage();
    drawHeader();
  }

  setText(colors.muted);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.text('AUTHORIZED SIGNATORY', MARGIN, signatureY - 4);
  doc.text('AUTHORIZED SIGNATORY', PAGE_WIDTH - MARGIN - 67, signatureY - 4);

  setDraw(colors.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, signatureY, MARGIN + 67, signatureY);
  doc.line(PAGE_WIDTH - MARGIN - 67, signatureY, PAGE_WIDTH - MARGIN, signatureY);

  const doctorOne = settings.doctors?.[0];
  const doctorTwo = settings.doctors?.[1];
  if (doctorOne) {
    setText(colors.ink);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.4);
    doc.text(clean(doctorOne.name), MARGIN, signatureY + 4);
    setText(colors.body);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.text(clean(doctorOne.qualification), MARGIN, signatureY + 8);
    doc.text(clean(doctorOne.designation), MARGIN, signatureY + 11.5);
  }
  if (doctorTwo) {
    const x = PAGE_WIDTH - MARGIN - 67;
    setText(colors.ink);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.4);
    doc.text(clean(doctorTwo.name), x, signatureY + 4);
    setText(colors.body);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.text(clean(doctorTwo.qualification), x, signatureY + 8);
    doc.text(clean(doctorTwo.designation), x, signatureY + 11.5);
  }

  setText(colors.muted);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.text(
    'This report is digitally generated. Please interpret results in conjunction with clinical findings.',
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 21,
    { align: 'center' },
  );

  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    drawFooter();
  }

  doc.putTotalPages(TOTAL_PAGES);
  doc.save(`LabReport_${String(report.patientName).replace(/[^A-Za-z0-9]+/g, '_')}_${reportNumber.replace(/[^A-Za-z0-9-]+/g, '_')}.pdf`);
};
