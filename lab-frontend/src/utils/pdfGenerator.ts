import { jsPDF } from 'jspdf';
import type { LabReport, LabSettings, TestParameter } from '../data/samples';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 13;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 25;
const HEADER_Y = 42;
const TOTAL_PAGES = '{total_pages_count_string}';

type PdfTemplate = 'classic' | 'modern' | 'compact' | 'detailed' | 'premium' | 'minimal';
type ReportParameter = TestParameter & { testName?: string; testCode?: string; category?: string; sampleType?: string; method?: string };
type ReportSection = { name: string; code?: string; category?: string; sampleType?: string; method?: string; parameters: ReportParameter[] };
type RGB = readonly [number, number, number];

const C = {
  navy: [17, 46, 74] as RGB,
  teal: [0, 120, 130] as RGB,
  tealPale: [235, 248, 249] as RGB,
  ink: [30, 40, 48] as RGB,
  body: [72, 84, 94] as RGB,
  muted: [111, 123, 132] as RGB,
  border: [211, 219, 224] as RGB,
  panel: [247, 249, 250] as RGB,
  white: [255, 255, 255] as RGB,
  green: [25, 116, 70] as RGB,
  greenPale: [239, 249, 243] as RGB,
  amber: [174, 99, 0] as RGB,
  amberPale: [255, 248, 236] as RGB,
  red: [180, 47, 47] as RGB,
  redPale: [255, 242, 242] as RGB,
};

const clean = (value: unknown, fallback = '—') => {
  const text = String(value ?? '').trim();
  return text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined' ? text : fallback;
};

function referenceRange(parameter: ReportParameter): string {
  const direct = clean(parameter.refRange, '');
  if (direct) return direct.replace(/\bnull\b/gi, '').replace(/\s*[-–]\s*$/g, '').trim() || '—';
  if (parameter.minRef !== undefined && parameter.maxRef !== undefined) return `${parameter.minRef} - ${parameter.maxRef}`;
  if (parameter.minRef !== undefined) return `>= ${parameter.minRef}`;
  if (parameter.maxRef !== undefined) return `<= ${parameter.maxRef}`;
  return '—';
}

function dateText(value: unknown): string {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
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
  return [`${table['*']}`, ...Array.from(safe).map((char) => table[char] || table['-']), `${table['*']}`];
}

function drawBarcode(doc: jsPDF, value: string, x: number, y: number, width: number, height: number) {
  const patterns = code39Patterns(value);
  const units = patterns.reduce((sum, pattern) => sum + pattern.length, 0) + patterns.length - 1;
  const module = Math.min((width - 4) / units, 0.42);
  let cursor = x + 2;
  doc.setFillColor(...C.ink);
  patterns.forEach((pattern, pIndex) => {
    for (let i = 0; i < pattern.length; i += 1) {
      if (pattern[i] === '1') doc.rect(cursor, y, module, height, 'F');
      cursor += module;
    }
    if (pIndex < patterns.length - 1) cursor += module;
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.setTextColor(...C.muted);
  doc.text(value, x + width / 2, y + height + 3.5, { align: 'center' });
}

export const generateReportPdf = (report: LabReport, settings: LabSettings, _template: PdfTemplate = 'premium') => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const accession = reportNumber(report);
  const sections = buildSections(report, (report.parameters ?? []) as ReportParameter[]);
  let cursorY = HEADER_Y + 7;

  doc.setProperties({ title: `Laboratory Report ${accession}`, subject: 'Laboratory Diagnostic Report', author: clean(settings.labName, 'Laboratory') });

  const text = (color: RGB) => doc.setTextColor(...color);
  const fill = (color: RGB) => doc.setFillColor(...color);
  const draw = (color: RGB) => doc.setDrawColor(...color);

  const footer = () => {
    draw(C.border); doc.setLineWidth(0.25); doc.line(MARGIN, FOOTER_Y, PAGE_WIDTH - MARGIN, FOOTER_Y);
    text(C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5);
    doc.text(`Report No: ${accession}`, MARGIN, FOOTER_Y + 5);
    doc.text('Electronically generated laboratory report', PAGE_WIDTH / 2, FOOTER_Y + 5, { align: 'center' });
    doc.text(`Page ${doc.getNumberOfPages()} of ${TOTAL_PAGES}`, PAGE_WIDTH - MARGIN, FOOTER_Y + 5, { align: 'right' });
    doc.setFontSize(5.1);
    doc.text('Reference intervals are laboratory-configured. Results should be interpreted with relevant clinical information.', PAGE_WIDTH / 2, FOOTER_Y + 10, { align: 'center' });
  };

  const header = (continuation = false) => {
    fill(C.navy); doc.rect(0, 0, PAGE_WIDTH, 4.5, 'F');
    text(C.navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(17);
    doc.text(clean(settings.labName, 'Diagnostic Laboratory'), MARGIN, 14);
    text(C.teal); doc.setFontSize(6.8); doc.text('DIAGNOSTIC LABORATORY', PAGE_WIDTH - MARGIN, 10, { align: 'right' });
    text(C.body); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.2);
    const address = clean(settings.address, '');
    if (address) doc.text(doc.splitTextToSize(address, 100), MARGIN, 20, { lineHeightFactor: 1.15 });
    const contact = [settings.phone, settings.email, settings.website].filter(Boolean).join('  •  ');
    if (contact) doc.text(contact, MARGIN, 27, { maxWidth: 110 });
    const accreditation = [settings.isoCertification, settings.licenseNumber ? `License: ${settings.licenseNumber}` : ''].filter(Boolean).join('  •  ');
    if (accreditation) { text(C.muted); doc.setFontSize(5.5); doc.text(accreditation, MARGIN, 33, { maxWidth: 112 }); }
    if (!continuation) drawBarcode(doc, accession, PAGE_WIDTH - MARGIN - 52, 15, 52, 13);
    else { text(C.navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('LABORATORY REPORT', PAGE_WIDTH - MARGIN, 14, { align: 'right' }); text(C.muted); doc.setFontSize(5.8); doc.text(`Report No: ${accession}`, PAGE_WIDTH - MARGIN, 19, { align: 'right' }); }
    draw(C.border); doc.setLineWidth(0.3); doc.line(MARGIN, 38, PAGE_WIDTH - MARGIN, 38);
  };

  const newPage = () => { doc.addPage(); header(true); cursorY = 45; };
  const ensure = (height: number) => { if (cursorY + height > FOOTER_Y - 3) newPage(); };

  const patientCard = () => {
    const y = 43; const h = 45;
    fill(C.panel); draw(C.border); doc.roundedRect(MARGIN, y, CONTENT_WIDTH, h, 2, 2, 'FD');
    text(C.navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text('PATIENT & ACCESSION INFORMATION', MARGIN + 4, y + 7);
    const cols = [MARGIN + 4, MARGIN + 68, MARGIN + 133];
    const field = (label: string, value: unknown, x: number, yy: number, w: number) => {
      text(C.muted); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.4); doc.text(label.toUpperCase(), x, yy);
      text(C.ink); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.text(doc.splitTextToSize(clean(value), w), x, yy + 4, { lineHeightFactor: 1.12 });
    };
    field('Patient Name', report.patientName, cols[0], y + 14, 58);
    field('Age / Gender', `${clean(report.age)} Yrs / ${clean(report.gender)}`, cols[0], y + 25, 58);
    field('Mobile', report.phone, cols[0], y + 36, 58);
    field('Report No.', accession, cols[1], y + 14, 59);
    field('Referred By', report.referredBy, cols[1], y + 25, 59);
    field('Email', report.email, cols[1], y + 36, 59);
    field('Collected', dateText(report.dateCollected), cols[2], y + 14, 46);
    field('Reported', dateText(report.dateReported), cols[2], y + 25, 46);
    const status = clean(report.status, 'Draft').toUpperCase(); const statusColor = status === 'COMPLETED' ? C.green : status === 'CRITICAL' ? C.red : C.amber; const statusBg = status === 'COMPLETED' ? C.greenPale : status === 'CRITICAL' ? C.redPale : C.amberPale;
    fill(statusBg); doc.roundedRect(cols[2], y + 33, 46, 7, 1.3, 1.3, 'F'); text(statusColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.2); doc.text(status, cols[2] + 23, y + 37.5, { align: 'center' });
  };

  const section = (item: ReportSection) => {
    ensure(23);
    fill(C.teal); doc.roundedRect(MARGIN, cursorY, CONTENT_WIDTH, 10, 1.2, 1.2, 'F');
    text(C.white); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.8); doc.text(item.name.toUpperCase(), MARGIN + 4, cursorY + 6.6); cursorY += 13;
    const meta = [item.code, item.category, item.sampleType ? `Sample: ${item.sampleType}` : '', item.method ? `Method: ${item.method}` : ''].filter(Boolean).join('  •  ');
    if (meta) { text(C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.6); doc.text(meta, MARGIN, cursorY); cursorY += 5; }
    const widths = [61, 27, 25, 49, 22]; const x = MARGIN; const xs = [x, x + 61, x + 88, x + 113, x + 162];
    const tableHeader = () => { fill(C.navy); doc.rect(x, cursorY, CONTENT_WIDTH, 8, 'F'); text(C.white); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.text('PARAMETER', xs[0] + 2.5, cursorY + 5.2); doc.text('RESULT', xs[1] + 2.5, cursorY + 5.2); doc.text('UNIT', xs[2] + 2.5, cursorY + 5.2); doc.text('REFERENCE INTERVAL', xs[3] + 2.5, cursorY + 5.2); doc.text('FLAG', xs[4] + 2.5, cursorY + 5.2); cursorY += 8; };
    tableHeader();
    item.parameters.forEach((p, index) => {
      const flag = clean(p.status, 'Abnormal'); const high = flag.toLowerCase() === 'high'; const low = flag.toLowerCase() === 'low'; const abnormal = high || low || flag.toLowerCase() === 'abnormal';
      const name = doc.splitTextToSize(clean(p.name), 56); const result = doc.splitTextToSize(clean(p.value), 23); const unit = doc.splitTextToSize(clean(p.unit), 21); const ref = doc.splitTextToSize(referenceRange(p), 44);
      const rowHeight = Math.max(9, 4.3 + Math.max(name.length, result.length, unit.length, ref.length) * 3.6);
      if (cursorY + rowHeight > FOOTER_Y - 3) { newPage(); sectionContinuation(item.name, meta); tableHeader(); }
      fill(abnormal ? (high ? C.redPale : C.amberPale) : index % 2 === 0 ? C.white : C.panel); doc.rect(x, cursorY, CONTENT_WIDTH, rowHeight, 'F');
      if (abnormal) { fill(high ? C.red : C.amber); doc.rect(x, cursorY, 1.1, rowHeight, 'F'); }
      draw(C.border); doc.setLineWidth(0.18); doc.line(x, cursorY + rowHeight, x + CONTENT_WIDTH, cursorY + rowHeight);
      text(abnormal ? (high ? C.red : C.amber) : C.ink); doc.setFont('helvetica', abnormal ? 'bold' : 'normal'); doc.setFontSize(6.8); doc.text(name, xs[0] + 3, cursorY + 5.2, { lineHeightFactor: 1.12 });
      text(C.ink); doc.setFont('helvetica', 'bold'); doc.text(result, xs[1] + 3, cursorY + 5.2, { lineHeightFactor: 1.12 });
      text(C.body); doc.setFont('helvetica', 'normal'); doc.text(unit, xs[2] + 3, cursorY + 5.2, { lineHeightFactor: 1.12 }); doc.text(ref, xs[3] + 3, cursorY + 5.2, { lineHeightFactor: 1.12 });
      const flagColor = abnormal ? (high ? C.red : C.amber) : C.green; text(flagColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.8); doc.text(flag.toUpperCase(), xs[4] + 2, cursorY + 5.2);
      cursorY += rowHeight;
    });
    cursorY += 6;
  };

  const interpretation = () => {
    const note = clean(report.interpretation, ''); if (!note) return;
    ensure(28); fill(C.tealPale); draw(C.border); const lines = doc.splitTextToSize(note, CONTENT_WIDTH - 10); const h = Math.max(19, 10 + lines.length * 3.6); doc.roundedRect(MARGIN, cursorY, CONTENT_WIDTH, h, 1.5, 1.5, 'FD'); text(C.navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2); doc.text('CLINICAL / LABORATORY COMMENTS', MARGIN + 5, cursorY + 7); text(C.body); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.3); doc.text(lines, MARGIN + 5, cursorY + 12, { lineHeightFactor: 1.2 }); cursorY += h + 7;
  };

  const authorization = () => {
    ensure(37); text(C.muted); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.8); doc.text('AUTHORIZED SIGNATORY', MARGIN, cursorY + 5); doc.text('AUTHORIZED SIGNATORY', PAGE_WIDTH - MARGIN - 67, cursorY + 5);
    draw(C.border); doc.setLineWidth(0.25); doc.line(MARGIN, cursorY + 18, MARGIN + 67, cursorY + 18); doc.line(PAGE_WIDTH - MARGIN - 67, cursorY + 18, PAGE_WIDTH - MARGIN, cursorY + 18);
    const one = settings.doctors?.[0]; const two = settings.doctors?.[1];
    const doctor = (item: { name?: string; qualification?: string; designation?: string } | undefined, x: number) => { if (!item) return; text(C.ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.text(clean(item.name), x, cursorY + 23); text(C.body); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.6); doc.text(clean(item.qualification, ''), x, cursorY + 27); doc.text(clean(item.designation, ''), x, cursorY + 30.5); };
    doctor(one, MARGIN); doctor(two, PAGE_WIDTH - MARGIN - 67); cursorY += 38;
  };

  header(); patientCard(); cursorY = 96;
  text(C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.7); doc.text('The following results are grouped by individual test for clear clinical review.', MARGIN, cursorY); cursorY += 6;
  sections.forEach(section);
  interpretation(); authorization();
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) { doc.setPage(page); footer(); }
  doc.putTotalPages(TOTAL_PAGES);
  return doc;
};

function sectionContinuation(name: string, meta: string) {
  // Intentionally empty: continuation header is drawn by the caller after page creation.
  void name; void meta;
}

function buildSections(_report: LabReport, parameters: ReportParameter[]): ReportSection[] {
  const grouped = new Map<string, ReportSection>();
  parameters.forEach((parameter) => {
    const name = clean(parameter.testName, 'Laboratory Test');
    const key = name.toLowerCase();
    const current = grouped.get(key);
    if (current) current.parameters.push(parameter);
    else grouped.set(key, { name, code: parameter.testCode, category: parameter.category, sampleType: parameter.sampleType, method: parameter.method, parameters: [parameter] });
  });
  if (!grouped.size) grouped.set('laboratory-test', { name: clean(_report.testType, 'Laboratory Test'), parameters: [] });
  return Array.from(grouped.values());
}
