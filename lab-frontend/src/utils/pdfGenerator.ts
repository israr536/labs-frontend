import { jsPDF } from 'jspdf';
import type { LabReport, LabSettings, TestParameter } from '../data/samples';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 13;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const HEADER_BOTTOM = 43;
const FOOTER_TOP = PAGE_HEIGHT - 28;
const TOTAL_PAGES = '{total_pages_count_string}';

type RGB = readonly [number, number, number];
type PdfTemplate = 'classic' | 'modern' | 'compact' | 'detailed' | 'premium' | 'minimal';
type ReportParameter = TestParameter & {
  testName?: string;
  testCode?: string;
  category?: string;
  sampleType?: string;
  method?: string;
};
type ReportSection = {
  name: string;
  code?: string;
  category?: string;
  sampleType?: string;
  method?: string;
  parameters: ReportParameter[];
};

/**
 * Creates the browser-side laboratory PDF used by the Reports screen.
 * The PDF is deliberately structured like an LIS result sheet: patient
 * accession details, a scannable Code 39 barcode, one section per test,
 * wrapped result tables, reference intervals and authorization/footer areas.
 */
export const generateReportPdf = (
  report: LabReport,
  settings: LabSettings,
  _template: PdfTemplate = 'premium',
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `Laboratory Report ${report.id}`, subject: 'Laboratory Diagnostic Report' });

  const colors = {
    navy: [20, 55, 82] as RGB,
    teal: [0, 119, 126] as RGB,
    tealLight: [232, 247, 248] as RGB,
    ink: [28, 39, 48] as RGB,
    body: [70, 82, 92] as RGB,
    muted: [108, 122, 132] as RGB,
    border: [210, 218, 223] as RGB,
    panel: [246, 249, 250] as RGB,
    white: [255, 255, 255] as RGB,
    normal: [27, 116, 70] as RGB,
    normalBg: [239, 249, 243] as RGB,
    low: [178, 101, 0] as RGB,
    lowBg: [255, 248, 235] as RGB,
    high: [181, 47, 47] as RGB,
    highBg: [255, 242, 242] as RGB,
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
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const reportNumber = clean(
    (report as LabReport & { reportNumber?: string }).reportNumber,
    String(report.id).startsWith('REP-') ? report.id : `LAB-${String(report.id).slice(0, 10).toUpperCase()}`,
  );

  const status = clean(report.status, 'Draft').toUpperCase();
  const statusColor = status === 'COMPLETED' ? colors.normal : status === 'CRITICAL' ? colors.high : colors.low;
  const statusBg = status === 'COMPLETED' ? colors.normalBg : status === 'CRITICAL' ? colors.highBg : colors.lowBg;

  const rawParameters = (report.parameters ?? []) as ReportParameter[];
  const sections = buildSections(report, rawParameters);
  let cursorY = HEADER_BOTTOM + 5;

  const drawBarcode = (value: string, x: number, y: number, width: number, height: number) => {
    const encoded = toCode39(value);
    if (!encoded) return;
    const quiet = 3;
    const usableWidth = Math.max(20, width - quiet * 2);
    const moduleCount = encoded.reduce((sum, pattern) => sum + pattern.length, 0);
    const scale = usableWidth / moduleCount;
    let currentX = x + quiet;

    encoded.forEach((pattern) => {
      for (let i = 0; i < pattern.length; i += 1) {
        const wide = pattern[i] === '1';
        const moduleWidth = scale * (wide ? 2.35 : 1);
        if (i % 2 === 0) {
          setFill(colors.ink);
          doc.rect(currentX, y, moduleWidth, height, 'F');
        }
        currentX += moduleWidth;
      }
      currentX += scale * 1.2;
    });

    setText(colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    doc.text(value, x + width / 2, y + height + 4, { align: 'center' });
  };

  const drawHeader = (continuation = false) => {
    setFill(colors.navy);
    doc.rect(0, 0, PAGE_WIDTH, 5, 'F');

    if (!continuation) {
      setText(colors.navy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(clean(settings.labName, 'Diagnostic Laboratory'), MARGIN, 14);

      setText(colors.teal);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('DIAGNOSTIC LABORATORY', PAGE_WIDTH - MARGIN, 10, { align: 'right' });

      setText(colors.body);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      const address = doc.splitTextToSize(clean(settings.address, ''), 92);
      doc.text(address, MARGIN, 20, { lineHeightFactor: 1.2 });
      const contact = [settings.phone, settings.email, settings.website].filter(Boolean).join('  •  ');
      if (contact) doc.text(contact, MARGIN, 27, { maxWidth: 112 });

      const accreditation = [settings.isoCertification, settings.licenseNumber ? `License: ${settings.licenseNumber}` : '']
        .filter(Boolean).join('  •  ');
      if (accreditation) {
        setText(colors.muted);
        doc.setFontSize(5.8);
        doc.text(accreditation, MARGIN, 32, { maxWidth: 115 });
      }

      drawBarcode(reportNumber, PAGE_WIDTH - MARGIN - 52, 15, 52, 13);
    } else {
      setText(colors.navy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(clean(settings.labName, 'Diagnostic Laboratory'), MARGIN, 13);
      setText(colors.muted);
      doc.setFontSize(6.5);
      doc.text(`Report No. ${reportNumber}`, PAGE_WIDTH - MARGIN, 12.5, { align: 'right' });
    }

    setDraw(colors.border);
    doc.setLineWidth(0.35);
    doc.line(MARGIN, 38, PAGE_WIDTH - MARGIN, 38);
  };

  const drawFooter = () => {
    setDraw(colors.border);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, FOOTER_TOP, PAGE_WIDTH - MARGIN, FOOTER_TOP);
    setText(colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.text(`Report No: ${reportNumber}`, MARGIN, FOOTER_TOP + 5);
    doc.text('Electronically generated laboratory report', PAGE_WIDTH / 2, FOOTER_TOP + 5, { align: 'center' });
    doc.text(`Page ${doc.getNumberOfPages()} of ${TOTAL_PAGES}`, PAGE_WIDTH - MARGIN, FOOTER_TOP + 5, { align: 'right' });
    doc.setFontSize(5.3);
    doc.text('Reference intervals are laboratory-configured and should be interpreted with relevant clinical information.', PAGE_WIDTH / 2, FOOTER_TOP + 10, { align: 'center' });
  };

  const drawPatientCard = () => {
    const y = 42;
    const height = 48;
    setFill(colors.panel);
    setDraw(colors.border);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, height, 2, 2, 'FD');

    setText(colors.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text('PATIENT / ACCESSION INFORMATION', MARGIN + 4, y + 7);

    const col1 = MARGIN + 4;
    const col2 = MARGIN + 69;
    const col3 = MARGIN + 133;
    const field = (label: string, value: unknown, x: number, yy: number, w: number) => {
      setText(colors.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.7);
      doc.text(label.toUpperCase(), x, yy);
      setText(colors.ink);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.1);
      const lines = doc.splitTextToSize(clean(value), w);
      doc.text(lines, x, yy + 4, { lineHeightFactor: 1.15 });
    };

    field('Patient Name', report.patientName, col1, y + 14, 59);
    field('Age / Gender', `${clean(report.age)} years / ${clean(report.gender)}`, col1, y + 25, 59);
    field('Mobile', report.phone, col1, y + 36, 59);

    field('Report / Accession No.', reportNumber, col2, y + 14, 59);
    field('Referred By', report.referredBy, col2, y + 25, 59);
    field('Email', report.email, col2, y + 36, 59);

    field('Sample Collected', formatDate(report.dateCollected), col3, y + 14, 47);
    field('Report Date', formatDate(report.dateReported), col3, y + 25, 47);

    setFill(statusBg);
    doc.roundedRect(col3, y + 34, 47, 8, 1.5, 1.5, 'F');
    setText(statusColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(status, col3 + 23.5, y + 39.2, { align: 'center' });
  };

  const newPage = () => {
    doc.addPage();
    drawHeader(true);
    cursorY = 45;
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height <= FOOTER_TOP - 3) return;
    newPage();
  };

  const drawSection = (section: ReportSection) => {
    const subtitle = [section.code, section.category, section.sampleType ? `Sample: ${section.sampleType}` : '', section.method ? `Method: ${section.method}` : '']
      .filter(Boolean).join('  •  ');

    ensureSpace(22);
    setFill(colors.teal);
    doc.roundedRect(MARGIN, cursorY, CONTENT_WIDTH, 10, 1.2, 1.2, 'F');
    setText(colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(section.name.toUpperCase(), MARGIN + 4, cursorY + 6.7);
    cursorY += 13;

    if (subtitle) {
      setText(colors.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.text(subtitle, MARGIN, cursorY, { maxWidth: CONTENT_WIDTH });
      cursorY += 5;
    }

    const x = MARGIN;
    const widths = [61, 29, 25, 48, 24];
    const xs = [x, x + widths[0], x + widths[0] + widths[1], x + widths[0] + widths[1] + widths[2], x + widths[0] + widths[1] + widths[2] + widths[3]];
    const headerHeight = 8;

    const drawTableHeader = () => {
      setFill(colors.navy);
      doc.rect(x, cursorY, CONTENT_WIDTH, headerHeight, 'F');
      setText(colors.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.9);
      doc.text('PARAMETER', xs[0] + 2.5, cursorY + 5.2);
      doc.text('RESULT', xs[1] + 2.5, cursorY + 5.2);
      doc.text('UNIT', xs[2] + 2.5, cursorY + 5.2);
      doc.text('REFERENCE INTERVAL', xs[3] + 2.5, cursorY + 5.2);
      doc.text('FLAG', xs[4] + 2.5, cursorY + 5.2);
      cursorY += headerHeight;
    };

    drawTableHeader();

    section.parameters.forEach((parameter, index) => {
      const flag = clean(parameter.status, 'Normal');
      const key = flag.toLowerCase();
      const isHigh = key === 'high' || key === 'critical';
      const isLow = key === 'low';
      const abnormal = isHigh || isLow || key === 'abnormal';
      const refRange = normalizeReferenceRange(parameter.refRange, parameter.minRef, parameter.maxRef);
      const nameLines = doc.splitTextToSize(clean(parameter.name), 56);
      const valueLines = doc.splitTextToSize(clean(parameter.value), 24);
      const unitLines = doc.splitTextToSize(clean(parameter.unit), 20);
      const refLines = doc.splitTextToSize(refRange, 43);
      const lineCount = Math.max(nameLines.length, valueLines.length, unitLines.length, refLines.length, 1);
      const rowHeight = Math.max(9.5, 4.5 + lineCount * 3.7);

      if (cursorY + rowHeight > FOOTER_TOP - 3) {
        newPage();
        drawSectionContinuation(section.name, subtitle);
        drawTableHeader();
      }

      setFill(index % 2 === 0 ? colors.white : colors.panel);
      doc.rect(x, cursorY, CONTENT_WIDTH, rowHeight, 'F');
      if (abnormal) {
        setFill(isHigh ? colors.highBg : colors.lowBg);
        doc.rect(x, cursorY, CONTENT_WIDTH, rowHeight, 'F');
        setFill(isHigh ? colors.high : colors.low);
        doc.rect(x, cursorY, 1.2, rowHeight, 'F');
      }

      setDraw(colors.border);
      doc.setLineWidth(0.18);
      doc.line(x, cursorY + rowHeight, x + CONTENT_WIDTH, cursorY + rowHeight);

      setText(abnormal ? (isHigh ? colors.high : colors.low) : colors.ink);
      doc.setFont('helvetica', abnormal ? 'bold' : 'normal');
      doc.setFontSize(7);
      doc.text(nameLines, xs[0] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });

      setText(colors.ink);
      doc.setFont('helvetica', 'bold');
      doc.text(valueLines, xs[1] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });

      setText(colors.body);
      doc.setFont('helvetica', 'normal');
      doc.text(unitLines, xs[2] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });
      doc.text(refLines, xs[3] + 3, cursorY + 5.5, { lineHeightFactor: 1.15 });

      const flagColor = isHigh ? colors.high : isLow ? colors.low : colors.normal;
      setText(flagColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.text(flag.toUpperCase(), xs[4] + 2.5, cursorY + 5.5, { maxWidth: widths[4] - 4 });

      cursorY += rowHeight;
    });

    cursorY += 7;
  };

  const drawSectionContinuation = (name: string, subtitle: string) => {
    ensureSpace(14);
    setText(colors.teal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`${name.toUpperCase()} — CONTINUED`, MARGIN, cursorY + 4);
    if (subtitle) {
      setText(colors.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.text(subtitle, MARGIN, cursorY + 8, { maxWidth: CONTENT_WIDTH });
    }
    cursorY += 12;
  };

  const drawInterpretation = () => {
    if (!report.interpretation?.trim()) return;
    const lines = doc.splitTextToSize(report.interpretation.trim(), CONTENT_WIDTH - 9);
    const height = Math.max(23, 11 + lines.length * 3.8);
    ensureSpace(height + 3);
    setFill(colors.tealLight);
    setDraw([175, 220, 222]);
    doc.roundedRect(MARGIN, cursorY, CONTENT_WIDTH, height, 1.5, 1.5, 'FD');
    setText(colors.teal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.3);
    doc.text('LABORATORY COMMENTS / CLINICAL NOTES', MARGIN + 4, cursorY + 7);
    setText(colors.body);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.7);
    doc.text(lines, MARGIN + 4, cursorY + 13, { lineHeightFactor: 1.3 });
    cursorY += height + 7;
  };

  const drawAuthorization = () => {
    const required = 34;
    if (cursorY + required > FOOTER_TOP - 2) newPage();
    const y = cursorY + 2;
    setText(colors.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.7);
    doc.text('AUTHORIZED SIGNATORY', MARGIN, y);
    doc.text('AUTHORIZED SIGNATORY', PAGE_WIDTH - MARGIN - 67, y);

    setDraw(colors.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + 14, MARGIN + 67, y + 14);
    doc.line(PAGE_WIDTH - MARGIN - 67, y + 14, PAGE_WIDTH - MARGIN, y + 14);

    const doctorOne = settings.doctors?.[0];
    const doctorTwo = settings.doctors?.[1];
    const doctor = (doctorOne: typeof doctorOne, x: number) => {
      if (!doctorOne) return;
      setText(colors.ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(clean(doctorOne.name), x, y + 19);
      setText(colors.body);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.text(clean(doctorOne.qualification), x, y + 23);
      doc.text(clean(doctorOne.designation), x, y + 26.5);
    };
    doctor(doctorOne, MARGIN);
    doctor(doctorTwo, PAGE_WIDTH - MARGIN - 67);
    cursorY = y + 31;
  };

  drawHeader();
  drawPatientCard();

  setText(colors.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.text('This report presents the recorded laboratory results for the accession shown above.', MARGIN, 96, { maxWidth: CONTENT_WIDTH });
  cursorY = 102;

  sections.forEach(drawSection);
  drawInterpretation();
  drawAuthorization();

  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    drawFooter();
  }
  doc.putTotalPages(TOTAL_PAGES);
  return doc;
};

function buildSections(report: LabReport, parameters: ReportParameter[]): ReportSection[] {
  const grouped = new Map<string, ReportSection>();
  const fallbackNames = clean(report.testType, 'Laboratory Test').split(/\s*\+\s*/).map((name) => name.trim()).filter(Boolean);

  parameters.forEach((parameter) => {
    let testName = parameter.testName?.trim();
    let parameterName = parameter.name?.trim() || 'Parameter';

    if (!testName && parameterName.includes(' — ')) {
      const parts = parameterName.split(' — ');
      if (parts.length > 1) {
        testName = parts.shift()?.trim();
        parameterName = parts.join(' — ').trim();
      }
    }

    testName = testName || (fallbackNames.length === 1 ? fallbackNames[0] : 'Laboratory Results');
    const key = testName.toLowerCase();
    let section = grouped.get(key);
    if (!section) {
      section = {
        name: testName,
        code: parameter.testCode,
        category: parameter.category,
        sampleType: parameter.sampleType,
        method: parameter.method,
        parameters: [],
      };
      grouped.set(key, section);
    }
    section.parameters.push({ ...parameter, name: parameterName });
  });

  if (!grouped.size) {
    grouped.set('laboratory results', {
      name: fallbackNames[0] || 'Laboratory Results',
      parameters: [],
    });
  }
  return [...grouped.values()];
}

function normalizeReferenceRange(value: unknown, minRef?: number, maxRef?: number): string {
  const raw = String(value ?? '').trim();
  if (raw && raw.toLowerCase() !== 'null - null' && raw.toLowerCase() !== 'null') return raw;
  if (minRef !== undefined && maxRef !== undefined) return `${minRef} - ${maxRef}`;
  if (minRef !== undefined) return `>= ${minRef}`;
  if (maxRef !== undefined) return `<= ${maxRef}`;
  return 'Not configured';
}

const CODE39: Record<string, string> = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101', '4': '101001101011',
  '5': '110100110101', '6': '101100110101', '7': '101001011011', '8': '110100101101', '9': '101100101101',
  A: '110101001011', B: '101101001011', C: '110110100101', D: '101011001011', E: '110101100101', F: '101101100101',
  G: '101010011011', H: '110101001101', I: '101101001101', J: '101011001101', K: '110101010011', L: '101101010011',
  M: '110110101001', N: '101011010011', O: '110101101001', P: '101101101001', Q: '101010110011', R: '110101011001',
  S: '101101011001', T: '101011011001', U: '110010101011', V: '100110101011', W: '110011010101', X: '100101101011',
  Y: '110010110101', Z: '100110110101', '-': '100101011011', '.': '110010101101', ' ': '100110101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '101001001001', '*': '100101101101',
};

function toCode39(value: string): string[] {
  const sanitized = value.toUpperCase().replace(/[^0-9A-Z\-\. $/+%]/g, '-').slice(0, 28);
  if (!sanitized) return [];
  return [`*${sanitized}*`].map((text) => text.split('').map((char) => CODE39[char] || CODE39['-']).join(''));
}
