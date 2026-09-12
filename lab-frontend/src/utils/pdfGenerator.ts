import { jsPDF } from 'jspdf';
import type { LabReport, LabSettings, TestParameter } from '../data/samples';

const PAGE_WIDTH = 210;
const LEFT = 9;
const RIGHT = 9;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
const TOP = 7;
const FOOTER_TOP = 265;
const TOTAL_PAGES = '{total_pages_count_string}';

type PdfTemplate = 'classic' | 'modern' | 'compact' | 'detailed' | 'premium' | 'minimal';
type ReportParameter = TestParameter & { testName?: string; testCode?: string; category?: string; sampleType?: string; method?: string };
type ReportSection = { name: string; code?: string; category?: string; sampleType?: string; method?: string; parameters: ReportParameter[] };

const clean = (value: unknown, fallback = '—') => {
  const text = String(value ?? '').trim();
  return text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined' ? text : fallback;
};

const upper = (value: unknown, fallback = '—') => clean(value, fallback).toUpperCase();

function referenceRange(parameter: ReportParameter): string {
  const direct = clean(parameter.refRange, '');
  if (direct) return direct.replace(/\bnull\b/gi, '').trim() || '—';
  if (parameter.minRef !== undefined && parameter.maxRef !== undefined) return `${parameter.minRef} - ${parameter.maxRef}`;
  if (parameter.minRef !== undefined) return `>= ${parameter.minRef}`;
  if (parameter.maxRef !== undefined) return `<= ${parameter.maxRef}`;
  return '—';
}

function dateText(value: unknown): string {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function reportNumber(report: LabReport): string {
  const value = clean((report as LabReport & { reportNumber?: string }).reportNumber, '');
  return value || (String(report.id).startsWith('REP-') ? String(report.id) : `LAB-${String(report.id).slice(0, 12).toUpperCase()}`);
}

function code39Patterns(value: string): string[] {
  const table: Record<string, string> = {
    '0':'101001101101','1':'110100101011','2':'101100101011','3':'110110010101','4':'101001101011','5':'110100110101','6':'101100110101','7':'101001011011','8':'110100101101','9':'101100101101',
    'A':'110101001011','B':'101101001011','C':'110110100101','D':'101011001011','E':'110101100101','F':'101101100101','G':'101010011011','H':'110101001101','I':'101101001101','J':'101011001101',
    'K':'110101010011','L':'101101010011','M':'110110101001','N':'101011010011','O':'110101101001','P':'101101101001','Q':'101010110011','R':'110101011001','S':'101101011001','T':'101011011001',
    'U':'110010101011','V':'100110101011','W':'110011010101','X':'100101101011','Y':'110010110101','Z':'100110110101','-':'100101011011','.':'110010101101',' ':'100110101101','$':'100100100101','/':'100100101001','+':'100101001001','%':'101001001001','*':'100101101101'
  };
  const safe = value.toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '-');
  return [table['*'], ...Array.from(safe).map((char) => table[char] || table['-']), table['*']];
}

function drawBarcode(doc: jsPDF, value: string, x: number, y: number, width: number, height: number) {
  const patterns = code39Patterns(value);
  const units = patterns.reduce((sum, pattern) => sum + pattern.length, 0) + patterns.length - 1;
  const module = Math.min((width - 1) / units, 0.3);
  let cursor = x;
  doc.setFillColor(0, 0, 0);
  patterns.forEach((pattern, pIndex) => {
    for (let i = 0; i < pattern.length; i += 1) { if (pattern[i] === '1') doc.rect(cursor, y, module, height, 'F'); cursor += module; }
    if (pIndex < patterns.length - 1) cursor += module;
  });
  doc.setFont('times', 'normal'); doc.setFontSize(5); doc.setTextColor(0, 0, 0); doc.text(value, x + width / 2, y + height + 3, { align: 'center' });
}

function drawQrPlaceholder(doc: jsPDF, x: number, y: number, size: number) {
  // Deliberately quiet QR-style mark when a laboratory QR asset is not configured.
  const cells = 13; const cell = size / cells;
  doc.setFillColor(0, 0, 0);
  const finder = (ox: number, oy: number) => { doc.rect(x + ox * cell, y + oy * cell, 7 * cell, 7 * cell, 'F'); doc.setFillColor(255, 255, 255); doc.rect(x + (ox + 1) * cell, y + (oy + 1) * cell, 5 * cell, 5 * cell, 'F'); doc.setFillColor(0, 0, 0); doc.rect(x + (ox + 2) * cell, y + (oy + 2) * cell, 3 * cell, 3 * cell, 'F'); };
  finder(0, 0); finder(6, 0); finder(0, 6);
  for (let row = 0; row < cells; row += 1) for (let col = 0; col < cells; col += 1) if ((row * 7 + col * 11) % 5 < 2 && !(row < 7 && col < 7) && !(row < 7 && col > 5) && !(row > 5 && col < 7)) doc.rect(x + col * cell, y + row * cell, cell, cell, 'F');
}

export const generateReportPdf = (report: LabReport, settings: LabSettings, _template: PdfTemplate = 'premium') => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const accession = reportNumber(report);
  const sections = buildSections(report, (report.parameters ?? []) as ReportParameter[]);
  let cursorY = 0;
  doc.setProperties({ title: `Laboratory Report ${accession}`, subject: 'Laboratory Diagnostic Report', author: clean(settings.labName, 'Laboratory') });
  doc.setLineHeightFactor(1.08);

  const text = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => { doc.setFont('times', style); doc.setFontSize(size); doc.setTextColor(0, 0, 0); };
  const line = (y: number, width = 0.25) => { doc.setDrawColor(0, 0, 0); doc.setLineWidth(width); doc.line(LEFT, y, PAGE_WIDTH - RIGHT, y); };

  const drawTopHeader = () => {
    text(7, 'bold'); doc.text(upper(settings.labName, 'DIAGNOSTIC LABORATORY'), PAGE_WIDTH - RIGHT, TOP + 1, { align: 'right' });
    text(5.6); const address = clean(settings.address, ''); if (address) doc.text(doc.splitTextToSize(address, 74), PAGE_WIDTH - RIGHT, TOP + 5, { align: 'right' });
    const phoneEmail = [settings.phone ? `Mob: ${settings.phone}` : '', settings.email ? `E-mail: ${settings.email}` : ''].filter(Boolean);
    doc.text(phoneEmail, PAGE_WIDTH - RIGHT, TOP + 11, { align: 'right' });
  };

  const drawPatientBox = () => {
    const y = 38; const h = 36;
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3); doc.rect(LEFT, y, CONTENT_WIDTH, h);
    const colA = LEFT + 3; const colB = LEFT + 99; const labelWidth = 32;
    const row = (label: string, value: unknown, x: number, yy: number, boldValue = false) => { text(7); doc.text(label, x, yy); doc.text(':', x + labelWidth - 1, yy); text(7, boldValue ? 'bold' : 'normal'); doc.text(clean(value), x + labelWidth + 2, yy); };
    row('Patient Name', `Mrs. ${upper(report.patientName)}`, colA, y + 7, true); row('Registration', dateText(report.dateCollected), colB, y + 7);
    row('Age/Gender', `${clean(report.age)} Year /${clean(report.gender)}`, colA, y + 13); row('Collected Date', dateText(report.dateCollected), colB, y + 13);
    row('Ref Doctor', upper(report.referredBy), colA, y + 19); row('Reported Date', dateText(report.dateReported), colB, y + 19);
    row('Lab ID', accession, colA, y + 25); row('Barcode No', accession, colB, y + 25);
    row('Client Name/Code', upper(settings.labName), colA, y + 31); row('Report Status', upper(report.status), colB, y + 31);
    drawBarcode(doc, accession, PAGE_WIDTH - RIGHT - 30, y + 19, 28, 8);
  };

  const drawPageFrame = (continuation = false) => {
    drawTopHeader();
    drawPatientBox();
    cursorY = 81;
    if (!continuation) cursorY = 81;
  };

  const drawTableHeader = () => {
    line(cursorY, 0.35); text(7, 'bold');
    doc.text('TEST DESCRIPTION', LEFT, cursorY + 5); doc.text('RESULT ENTRY', LEFT + 78, cursorY + 5); doc.text('FLAG', LEFT + 119, cursorY + 5); doc.text('BIO. REF. RANGE', LEFT + 133, cursorY + 5); doc.text('UNIT', PAGE_WIDTH - RIGHT - 23, cursorY + 5);
    line(cursorY + 7, 0.3); cursorY += 9;
  };

  const footer = () => {
    drawQrPlaceholder(doc, LEFT + 6, 274, 17);
    text(5.2); doc.text('This report is not valid for medico legal purposes.', LEFT + 1, 294 - 8); doc.text('Please correlate with clinical conditions.', LEFT + 1, 294 - 5);
    const doctors = settings.doctors ?? [];
    const doctor = (item: { name?: string; qualification?: string; designation?: string; signatureUrl?: string } | undefined, x: number) => { if (!item) return; text(7, 'italic'); doc.text('Authorized signature', x, 276, { align: 'center' }); text(7, 'bold'); doc.text(clean(item.name), x, 285, { align: 'center' }); text(6); doc.text(clean(item.qualification, ''), x, 289, { align: 'center' }); doc.text(clean(item.designation, ''), x, 292, { align: 'center' }); };
    doctor(doctors[0], 83); doctor(doctors[1], 158);
    text(6); doc.text(`${doc.getNumberOfPages()} / ${TOTAL_PAGES}`, PAGE_WIDTH - RIGHT, 294, { align: 'right' });
  };

  const newPage = () => { footer(); doc.addPage(); drawPageFrame(true); };
  const ensure = (height: number) => { if (cursorY + height > FOOTER_TOP) newPage(); };

  const drawSection = (section: ReportSection) => {
    ensure(30); text(8, 'bold'); doc.text(upper(section.category || 'HEMATOLOGY'), PAGE_WIDTH / 2, cursorY + 5, { align: 'center' });
    text(8, 'bold'); doc.text(upper(section.name), PAGE_WIDTH / 2, cursorY + 10, { align: 'center' });
    const sample = section.sampleType ? `Sample Type: ${section.sampleType}` : '';
    if (sample) { text(5.5); doc.text(sample, LEFT, cursorY + 10); }
    cursorY += 14; drawTableHeader();
    section.parameters.forEach((parameter) => {
      const flag = clean(parameter.status, ''); const abnormal = flag.toLowerCase() !== 'normal' && flag !== '—';
      const flagLabel = flag.toLowerCase() === 'high' ? 'H ↑' : flag.toLowerCase() === 'low' ? 'L ↓' : flag.toLowerCase() === 'abnormal' ? 'A' : '';
      const nameLines = doc.splitTextToSize(clean(parameter.name), 68); const methodLines = parameter.method ? doc.splitTextToSize(`METHOD : ${upper(parameter.method)}`, 68) : [];
      const resultLines = doc.splitTextToSize(clean(parameter.value), 28); const refLines = doc.splitTextToSize(referenceRange(parameter), 39); const unitLines = doc.splitTextToSize(clean(parameter.unit), 18);
      const height = Math.max(7, nameLines.length * 3.4 + methodLines.length * 2.5 + 1.5, resultLines.length * 3.4 + 1.5, refLines.length * 3.4 + 1.5, unitLines.length * 3.4 + 1.5);
      ensure(height + 2); if (cursorY < 78) drawTableHeader();
      text(7, abnormal ? 'bold' : 'normal'); doc.text(nameLines, LEFT, cursorY + 3.2, { lineHeightFactor: 1 });
      if (methodLines.length) { text(4.8); doc.text(methodLines, LEFT + 5, cursorY + 6.2, { lineHeightFactor: 1 }); }
      text(7, abnormal ? 'bold' : 'normal'); if (abnormal) doc.setTextColor(flag.toLowerCase() === 'high' ? 160 : 30, 0, flag.toLowerCase() === 'high' ? 0 : 60); doc.text(resultLines, LEFT + 78, cursorY + 3.2, { lineHeightFactor: 1 });
      text(7, 'bold'); doc.text(flagLabel, LEFT + 119, cursorY + 3.2);
      text(7, abnormal ? 'bold' : 'normal'); doc.text(refLines, LEFT + 133, cursorY + 3.2, { lineHeightFactor: 1 }); doc.text(unitLines, PAGE_WIDTH - RIGHT - 23, cursorY + 3.2, { lineHeightFactor: 1 });
      line(cursorY + height, 0.12); cursorY += height;
    });
    cursorY += 3;
  };

  const drawInterpretation = () => {
    const note = clean(report.interpretation, ''); if (!note) return; ensure(25); text(7, 'bold'); doc.text('Interpretation:', LEFT, cursorY + 5); text(6); const lines = doc.splitTextToSize(note, CONTENT_WIDTH - 2); doc.text(lines, LEFT, cursorY + 11, { lineHeightFactor: 1.08 }); cursorY += 12 + lines.length * 3;
  };

  drawPageFrame();
  sections.forEach(drawSection);
  drawInterpretation();
  footer();
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) { doc.setPage(page); }
  doc.putTotalPages(TOTAL_PAGES);
  return doc;
};

function buildSections(_report: LabReport, parameters: ReportParameter[]): ReportSection[] {
  const grouped = new Map<string, ReportSection>();
  parameters.forEach((parameter) => { const name = clean(parameter.testName, _report.testType || 'Laboratory Test'); const key = name.toLowerCase(); const current = grouped.get(key); if (current) current.parameters.push(parameter); else grouped.set(key, { name, code: parameter.testCode, category: parameter.category, sampleType: parameter.sampleType, method: parameter.method, parameters: [parameter] }); });
  if (!grouped.size) grouped.set('laboratory-test', { name: clean(_report.testType, 'Laboratory Test'), parameters: [] });
  return Array.from(grouped.values());
}
