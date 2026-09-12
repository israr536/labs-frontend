import type { LabReport, LabSettings } from '../data/samples';

interface ReportPrintViewProps {
  report: LabReport | null;
  settings: LabSettings;
}

export default function ReportPrintView({ report, settings }: ReportPrintViewProps) {
  if (!report) return null;

  return (
    <div className="printable-report">
      {/* 1. Letterhead Brand Header */}
      <div className="print-header">
        <div className="header-brand-left">
          <div className="print-logo-circle"></div>
          <div className="print-brand-text">
            <h2>{settings.labName}</h2>
            <p className="tagline">{settings.tagline}</p>
            <p className="certifications">{settings.isoCertification}</p>
          </div>
        </div>
        <div className="header-brand-right">
          <p>{settings.address}</p>
          <p>Phone: {settings.phone}</p>
          <p>Email: {settings.email}</p>
          <p>Web: {settings.website}</p>
          <p className="license-tag">LIC: {settings.licenseNumber}</p>
        </div>
      </div>

      {/* 2. Patient Demographics Metadata Grid */}
      <div className="print-patient-card">
        <div className="print-grid-col">
          <div className="meta-row"><span className="lbl">Patient Name:</span><span className="val bold-text">{report.patientName}</span></div>
          <div className="meta-row"><span className="lbl">Age / Gender:</span><span className="val">{report.age} Yrs / {report.gender}</span></div>
          <div className="meta-row"><span className="lbl">Contact No:</span><span className="val">{report.phone}</span></div>
        </div>
        <div className="print-grid-col">
          <div className="meta-row"><span className="lbl">Report ID:</span><span className="val bold-text">{report.id}</span></div>
          <div className="meta-row"><span className="lbl">Referred By:</span><span className="val">{report.referredBy}</span></div>
          <div className="meta-row"><span className="lbl">Email ID:</span><span className="val">{report.email || "N/A"}</span></div>
        </div>
        <div className="print-grid-col">
          <div className="meta-row"><span className="lbl">Date Collected:</span><span className="val">{new Date(report.dateCollected).toLocaleString()}</span></div>
          <div className="meta-row"><span className="lbl">Date Reported:</span><span className="val">{new Date(report.dateReported).toLocaleString()}</span></div>
          <div className="meta-row">
            <span className="lbl">Status:</span>
            <span className={`val bold-text ${report.status === 'Critical' ? 'text-critical' : ''}`}>
              {report.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Simulated Print Barcode */}
        <div className="barcode-simulation">
          <div className="barcode-lines"></div>
          <span className="barcode-label">{report.id}</span>
        </div>
      </div>

      {/* 3. Diagnostic Report Title */}
      <div className="print-title-block">
        <p className="dept-title">DEPARTMENT OF CLINICAL PATHOLOGY & BIOCHEMISTRY</p>
        <h3 className="test-title">TEST REPORT: {report.testType.toUpperCase()}</h3>
      </div>

      {/* 4. Parameters Table */}
      <table className="print-parameters-table">
        <thead>
          <tr>
            <th>TEST PARAMETER</th>
            <th className="center-text">OBSERVED VALUE</th>
            <th>UNIT</th>
            <th>BIOLOGICAL REF RANGE</th>
            <th>FLAG</th>
          </tr>
        </thead>
        <tbody>
          {report.parameters.map((param, idx) => {
            const isAbnormal = param.status !== 'Normal';
            return (
              <tr key={idx} className={isAbnormal ? 'print-highlight' : ''}>
                <td className={isAbnormal ? 'bold-text' : ''}>{param.name}</td>
                <td className={`center-text ${isAbnormal ? 'bold-text abnormal-val' : ''}`}>
                  {param.value}
                </td>
                <td>{param.unit || "-"}</td>
                <td>{param.refRange}</td>
                <td className={isAbnormal ? 'bold-text' : ''}>
                  {param.status === 'Normal' ? 'Normal' : param.status.toUpperCase()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 5. Interpretation / Advice Notes */}
      {report.interpretation && (
        <div className="print-interpretation-box">
          <h4>CLINICAL INTERPRETATION / ADVISORY</h4>
          <p>{report.interpretation}</p>
        </div>
      )}

      {/* 6. PATHOLOGIST SIGNATURE FOOTER */}
      <div className="print-signature-footer">
        {settings.doctors.map((doctor, idx) => (
          <div key={idx} className="print-sig-col">
            <div className="signature-line"></div>
            <p className="sig-name">{doctor.name}</p>
            <p className="sig-qual">{doctor.qualification}</p>
            <p className="sig-desg">{doctor.designation}</p>
          </div>
        ))}
      </div>

      {/* 7. Accreditation Bottom Bar */}
      <div className="print-disclaimer-bar">
        <p>*** End of Laboratory Report ***</p>
        <p className="sub-disc">This is a secure electronic diagnostic record. Original signature stamps are verified and held by Apex Lab Administrators.</p>
      </div>

      <style>{`
        /* Screen view rules (hidden on screen) */
        .printable-report {
          display: none;
        }

        /* Printable Document CSS */
        @media print {
          .printable-report {
            display: block;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm 20mm;
            background: white;
            color: black;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
          }

          /* Letterhead styling */
          .print-header {
            border-bottom: 2px solid #066089;
            padding-bottom: 12px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .header-brand-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .print-logo-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #066089;
            border: 4px double white;
            box-shadow: 0 0 0 2px #066089;
          }

          .print-brand-text h2 {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 18pt;
            font-weight: 700;
            color: #066089;
            margin: 0;
          }

          .print-brand-text .tagline {
            font-size: 8pt;
            font-style: italic;
            color: #475569;
            margin: 0;
          }

          .print-brand-text .certifications {
            font-size: 7.5pt;
            font-weight: bold;
            color: #0eb89d;
            margin: 2px 0 0 0;
          }

          .header-brand-right {
            text-align: right;
            font-size: 7.5pt;
            color: #475569;
          }

          .header-brand-right p {
            margin: 0 0 1px 0;
          }

          .header-brand-right .license-tag {
            font-weight: bold;
            color: #066089;
            margin-top: 3px;
          }

          /* Patient Demographics grid */
          .print-patient-card {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            padding: 8px 12px;
            display: grid;
            grid-template-columns: 1.1fr 1fr 1.1fr;
            gap: 10px;
            margin-bottom: 15px;
            position: relative;
          }

          .print-grid-col {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .meta-row {
            display: flex;
            font-size: 8pt;
          }

          .meta-row .lbl {
            font-weight: bold;
            color: #64748b;
            width: 85px;
            flex-shrink: 0;
          }

          .meta-row .val {
            color: #0f172a;
          }

          .bold-text {
            font-weight: bold;
          }

          .text-critical {
            color: #ef4444;
          }

          /* Barcode styling */
          .barcode-simulation {
            position: absolute;
            right: 12px;
            bottom: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .barcode-lines {
            width: 35px;
            height: 14px;
            background: repeating-linear-gradient(
              90deg,
              #0f172a,
              #0f172a 1px,
              transparent 1px,
              transparent 3px,
              #0f172a 3px,
              #0f172a 4px
            );
          }

          .barcode-label {
            font-size: 5pt;
            color: #64748b;
            margin-top: 1px;
          }

          /* Test Title Block */
          .print-title-block {
            margin-bottom: 12px;
            border-left: 3px solid #066089;
            padding-left: 10px;
          }

          .dept-title {
            font-size: 7.5pt;
            font-weight: bold;
            color: #066089;
            margin: 0;
            letter-spacing: 0.5px;
          }

          .test-title {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 10.5pt;
            font-weight: bold;
            color: #0f172a;
            margin: 2px 0 0 0;
          }

          /* Parameter table layout */
          .print-parameters-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 8.5pt;
          }

          .print-parameters-table th {
            background: #066089;
            color: white;
            font-weight: bold;
            padding: 5px 8px;
            text-align: left;
            font-size: 8pt;
          }

          .print-parameters-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }

          .print-parameters-table tr:last-child td {
            border-bottom: 2px solid #066089;
          }

          .center-text {
            text-align: center;
          }

          /* Highlights for out-of-range readings */
          .print-highlight {
            background-color: #fef2f2 !important;
          }

          .abnormal-val {
            color: #ef4444;
          }

          /* Interpretation advisory card */
          .print-interpretation-box {
            border: 1px solid #cbd5e1;
            background: #fafafa;
            padding: 8px 12px;
            margin-bottom: 25px;
            font-size: 8pt;
          }

          .print-interpretation-box h4 {
            font-size: 8pt;
            font-weight: bold;
            color: #066089;
            margin: 0 0 4px 0;
            letter-spacing: 0.5px;
          }

          .print-interpretation-box p {
            color: #334155;
            margin: 0;
            text-align: justify;
          }

          /* Signature block footer */
          .print-signature-footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }

          .print-sig-col {
            text-align: center;
            width: 70mm;
          }

          .signature-line {
            border-top: 1px solid #94a3b8;
            margin-bottom: 6px;
            width: 100%;
          }

          .sig-name {
            font-size: 8.5pt;
            font-weight: bold;
            color: #0f172a;
            margin: 0;
          }

          .sig-qual {
            font-size: 7.5pt;
            color: #475569;
            margin: 0;
          }

          .sig-desg {
            font-size: 7.5pt;
            font-style: italic;
            color: #64748b;
            margin: 0;
          }

          /* Bottom accreditation footer */
          .print-disclaimer-bar {
            margin-top: 30px;
            text-align: center;
            font-size: 7pt;
            color: #94a3b8;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
            page-break-inside: avoid;
          }

          .print-disclaimer-bar p {
            margin: 0 0 2px 0;
          }

          .print-disclaimer-bar .sub-disc {
            font-size: 6.5pt;
          }
        }
      `}</style>
    </div>
  );
}
