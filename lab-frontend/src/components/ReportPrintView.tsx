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
              {(report.status ?? 'Not set').toUpperCase()}
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


    </div>
  );
}
