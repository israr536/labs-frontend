export interface TestParameter {
  name: string;
  value: string;
  unit: string;
  refRange: string;
  minRef?: number;
  maxRef?: number;
  status: 'Normal' | 'High' | 'Low' | 'Abnormal';
}

export interface LabReport {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  referredBy: string;
  dateCollected: string;
  dateReported: string;
  testType: string;
  status: 'Completed' | 'Pending' | 'Critical' | 'Draft';
  parameters: TestParameter[];
  interpretation: string;
}

export interface LabSettings {
  labName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  licenseNumber: string;
  isoCertification: string;
  doctors: {
    name: string;
    qualification: string;
    designation: string;
    signatureUrl?: string;
  }[];
}

export const DEFAULT_SETTINGS: LabSettings = {
  labName: "Apex Clinical Diagnostics",
  tagline: "Precision Care Through Reliable Testing",
  address: "Suite 402, Medical Enclave, Sector 15, New Delhi - 110001",
  phone: "+91 11 4987 6543 / +91 98765 43210",
  email: "contact@apexdiagnostics.com",
  website: "www.apexdiagnostics.com",
  licenseNumber: "DL-34892-MED",
  isoCertification: "ISO 9001:2015 & NABL Accredited (M-2245)",
  doctors: [
    {
      name: "Dr. Rachel Green, MD",
      qualification: "MD, Pathologist & Hematologist",
      designation: "Laboratory Director"
    },
    {
      name: "Dr. Sarah Paulson, PhD",
      qualification: "PhD in Clinical Biochemistry",
      designation: "Senior Biochemist"
    }
  ]
};

export const TEST_TEMPLATES: { [key: string]: Omit<TestParameter, 'value' | 'status'>[] } = {
  "Complete Blood Count (CBC)": [
    { name: "Hemoglobin", unit: "g/dL", refRange: "13.5 - 17.5 (Male), 12.0 - 15.5 (Female)", minRef: 13.5, maxRef: 17.5 },
    { name: "Red Blood Cells (RBC)", unit: "M/µL", refRange: "4.3 - 5.9 (Male), 3.8 - 5.2 (Female)", minRef: 4.3, maxRef: 5.9 },
    { name: "Hematocrit (HCT)", unit: "%", refRange: "41.0 - 50.0 (Male), 36.0 - 46.0 (Female)", minRef: 41.0, maxRef: 50.0 },
    { name: "White Blood Cells (WBC)", unit: "K/µL", refRange: "4.5 - 11.0", minRef: 4.5, maxRef: 11.0 },
    { name: "Platelet Count", unit: "K/µL", refRange: "150 - 450", minRef: 150, maxRef: 450 },
    { name: "Mean Corpuscular Volume (MCV)", unit: "fL", refRange: "80 - 100", minRef: 80, maxRef: 100 },
    { name: "Mean Corpuscular Hb (MCH)", unit: "pg", refRange: "27 - 33", minRef: 27, maxRef: 33 },
    { name: "Mean Corpuscular Hb Conc (MCHC)", unit: "g/dL", refRange: "32 - 36", minRef: 32, maxRef: 36 }
  ],
  "Lipid Profile": [
    { name: "Total Cholesterol", unit: "mg/dL", refRange: "< 200 (Desirable)", maxRef: 200 },
    { name: "Triglycerides", unit: "mg/dL", refRange: "< 150 (Normal)", maxRef: 150 },
    { name: "HDL Cholesterol", unit: "mg/dL", refRange: "> 40 (Optimal)", minRef: 40 },
    { name: "LDL Cholesterol", unit: "mg/dL", refRange: "< 100 (Optimal)", maxRef: 100 },
    { name: "VLDL Cholesterol", unit: "mg/dL", refRange: "5 - 30 (Normal)", minRef: 5, maxRef: 30 },
    { name: "Cholesterol / HDL Ratio", unit: "ratio", refRange: "< 5.0 (Low Risk)", maxRef: 5.0 }
  ],
  "Thyroid Profile": [
    { name: "Thyroid Stimulating Hormone (TSH)", unit: "µIU/mL", refRange: "0.45 - 4.50", minRef: 0.45, maxRef: 4.50 },
    { name: "Free Triiodothyronine (Free T3)", unit: "pg/mL", refRange: "2.3 - 4.2", minRef: 2.3, maxRef: 4.2 },
    { name: "Free Thyroxine (Free T4)", unit: "ng/dL", refRange: "0.82 - 1.77", minRef: 0.82, maxRef: 1.77 }
  ],
  "Liver Function Test (LFT)": [
    { name: "Total Bilirubin", unit: "mg/dL", refRange: "0.20 - 1.20", minRef: 0.20, maxRef: 1.20 },
    { name: "Direct Bilirubin", unit: "mg/dL", refRange: "< 0.30", maxRef: 0.30 },
    { name: "Indirect Bilirubin", unit: "mg/dL", refRange: "0.20 - 0.80", minRef: 0.20, maxRef: 0.80 },
    { name: "SGPT (ALT)", unit: "U/L", refRange: "7 - 56", minRef: 7, maxRef: 56 },
    { name: "SGOT (AST)", unit: "U/L", refRange: "10 - 40", minRef: 10, maxRef: 40 },
    { name: "Alkaline Phosphatase (ALP)", unit: "U/L", refRange: "44 - 147", minRef: 44, maxRef: 147 },
    { name: "Total Protein", unit: "g/dL", refRange: "6.0 - 8.3", minRef: 6.0, maxRef: 8.3 },
    { name: "Albumin", unit: "g/dL", refRange: "3.5 - 5.0", minRef: 3.5, maxRef: 5.0 },
    { name: "Globulin", unit: "g/dL", refRange: "2.3 - 3.5", minRef: 2.3, maxRef: 3.5 }
  ],
  "Kidney Function Test (RFT/KFT)": [
    { name: "Blood Urea Nitrogen (BUN)", unit: "mg/dL", refRange: "7 - 20", minRef: 7, maxRef: 20 },
    { name: "Serum Creatinine", unit: "mg/dL", refRange: "0.60 - 1.30", minRef: 0.60, maxRef: 1.30 },
    { name: "Uric Acid", unit: "mg/dL", refRange: "3.5 - 7.2", minRef: 3.5, maxRef: 7.2 },
    { name: "eGFR", unit: "mL/min/1.73m²", refRange: "> 90", minRef: 90 }
  ],
  "Diabetes Panel": [
    { name: "HbA1c (Glycated Hemoglobin)", unit: "%", refRange: "4.0 - 5.6 (Normal), 5.7 - 6.4 (Pre-Diabetic), >= 6.5 (Diabetic)", minRef: 4.0, maxRef: 5.6 },
    { name: "Fasting Blood Sugar (FBS)", unit: "mg/dL", refRange: "70 - 99", minRef: 70, maxRef: 99 },
    { name: "Post Prandial Blood Sugar (PPBS)", unit: "mg/dL", refRange: "< 140", maxRef: 140 }
  ],
  "Electrolytes Panel": [
    { name: "Sodium (Na+)", unit: "mEq/L", refRange: "135 - 145", minRef: 135, maxRef: 145 },
    { name: "Potassium (K+)", unit: "mEq/L", refRange: "3.5 - 5.1", minRef: 3.5, maxRef: 5.1 },
    { name: "Chloride (Cl-)", unit: "mEq/L", refRange: "96 - 106", minRef: 96, maxRef: 106 },
    { name: "Bicarbonate (HCO3-)", unit: "mEq/L", refRange: "22 - 29", minRef: 22, maxRef: 29 }
  ],
  "Urine Routine Analysis": [
    { name: "Color", unit: "", refRange: "Pale Yellow" },
    { name: "Transparency", unit: "", refRange: "Clear" },
    { name: "Specific Gravity", unit: "", refRange: "1.005 - 1.030", minRef: 1.005, maxRef: 1.030 },
    { name: "pH", unit: "", refRange: "5.0 - 8.0", minRef: 5.0, maxRef: 8.0 },
    { name: "Protein", unit: "", refRange: "Negative" },
    { name: "Glucose", unit: "", refRange: "Negative" },
    { name: "Nitrite", unit: "", refRange: "Negative" },
    { name: "Leucocytes", unit: "/hpf", refRange: "< 5", maxRef: 5 },
    { name: "RBCs", unit: "/hpf", refRange: "< 5", maxRef: 5 }
  ],
  "Vitamin Profile": [
    { name: "Vitamin D3 (25-OH)", unit: "ng/mL", refRange: "30.0 - 100.0 (Sufficiency)", minRef: 30.0, maxRef: 100.0 },
    { name: "Vitamin B12", unit: "pg/mL", refRange: "211 - 911", minRef: 211, maxRef: 911 }
  ],
  "Cardiac Biomarkers Panel": [
    { name: "Troponin I (Ultra-sensitive)", unit: "ng/mL", refRange: "< 0.04", maxRef: 0.04 },
    { name: "CK-MB", unit: "ng/mL", refRange: "< 5.0", maxRef: 5.0 },
    { name: "Myoglobin", unit: "ng/mL", refRange: "< 90", maxRef: 90 }
  ]
};

export const SAMPLE_REPORTS: LabReport[] = [
  {
    id: "REP-2026-101",
    patientName: "Johnathan Doe",
    age: 45,
    gender: "Male",
    phone: "+91 98112 34567",
    email: "john.doe@gmail.com",
    referredBy: "Dr. Robert H. Vance, MD",
    dateCollected: "2026-06-08T09:00",
    dateReported: "2026-06-08T17:30",
    testType: "Complete Blood Count (CBC)",
    status: "Completed",
    parameters: [
      { name: "Hemoglobin", value: "11.2", unit: "g/dL", refRange: "13.5 - 17.5 (Male)", minRef: 13.5, maxRef: 17.5, status: "Low" },
      { name: "Red Blood Cells (RBC)", value: "3.8", unit: "M/µL", refRange: "4.3 - 5.9", minRef: 4.3, maxRef: 5.9, status: "Low" },
      { name: "Hematocrit (HCT)", value: "34.0", unit: "%", refRange: "41.0 - 50.0", minRef: 41.0, maxRef: 50.0, status: "Low" },
      { name: "White Blood Cells (WBC)", value: "7.2", unit: "K/µL", refRange: "4.5 - 11.0", minRef: 4.5, maxRef: 11.0, status: "Normal" },
      { name: "Platelet Count", value: "220", unit: "K/µL", refRange: "150 - 450", minRef: 150, maxRef: 450, status: "Normal" },
      { name: "Mean Corpuscular Volume (MCV)", value: "89.5", unit: "fL", refRange: "80 - 100", minRef: 80, maxRef: 100, status: "Normal" },
      { name: "Mean Corpuscular Hb (MCH)", value: "29.5", unit: "pg", refRange: "27 - 33", minRef: 27, maxRef: 33, status: "Normal" },
      { name: "Mean Corpuscular Hb Conc (MCHC)", value: "32.9", unit: "g/dL", refRange: "32 - 36", minRef: 32, maxRef: 36, status: "Normal" }
    ],
    interpretation: "Patient presents with microcytic, hypochromic parameters indicating mild iron deficiency anemia. RBC count, Hemoglobin, and Hematocrit are all below standard reference thresholds. Peripheral smear evaluation is recommended to confirm morphology. Oral iron supplementation and dietary adjustment are suggested under clinical guidance."
  },
  {
    id: "REP-2026-102",
    patientName: "Sarah Jenkins",
    age: 32,
    gender: "Female",
    phone: "+91 95601 98765",
    email: "sarah.jenkins@outlook.com",
    referredBy: "Dr. Neha Sharma, MBBS",
    dateCollected: "2026-06-08T08:30",
    dateReported: "2026-06-08T18:00",
    testType: "Lipid Profile",
    status: "Completed",
    parameters: [
      { name: "Total Cholesterol", value: "245", unit: "mg/dL", refRange: "< 200 (Desirable)", maxRef: 200, status: "High" },
      { name: "Triglycerides", value: "185", unit: "mg/dL", refRange: "< 150 (Normal)", maxRef: 150, status: "High" },
      { name: "HDL Cholesterol", value: "42", unit: "mg/dL", refRange: "> 40 (Optimal)", minRef: 40, status: "Normal" },
      { name: "LDL Cholesterol", value: "166", unit: "mg/dL", refRange: "< 100 (Optimal)", maxRef: 100, status: "High" },
      { name: "VLDL Cholesterol", value: "37", unit: "mg/dL", refRange: "5 - 30 (Normal)", minRef: 5, maxRef: 30, status: "High" },
      { name: "Cholesterol / HDL Ratio", value: "5.8", unit: "ratio", refRange: "< 5.0 (Low Risk)", maxRef: 5.0, status: "High" }
    ],
    interpretation: "Lipid profile demonstrates moderate mixed dyslipidemia, characterized by elevated Total Cholesterol, LDL-C, VLDL-C, and Triglycerides. The Cholesterol/HDL ratio of 5.8 indicates an increased long-term cardiovascular risk profile. Lifestyle modifications including low-saturated-fat diet, cardiovascular exercise, and re-evaluation in 8 weeks are recommended."
  },
  {
    id: "REP-2026-103",
    patientName: "Robert Chen",
    age: 58,
    gender: "Male",
    phone: "+91 98991 12345",
    email: "robert.chen@yahoo.com",
    referredBy: "Dr. K. K. Sen, MD (Endocrinology)",
    dateCollected: "2026-06-07T07:15",
    dateReported: "2026-06-07T16:45",
    testType: "Thyroid Profile",
    status: "Completed",
    parameters: [
      { name: "Thyroid Stimulating Hormone (TSH)", value: "7.80", unit: "µIU/mL", refRange: "0.45 - 4.50", minRef: 0.45, maxRef: 4.50, status: "High" },
      { name: "Free Triiodothyronine (Free T3)", value: "2.10", unit: "pg/mL", refRange: "2.3 - 4.2", minRef: 2.3, maxRef: 4.2, status: "Low" },
      { name: "Free Thyroxine (Free T4)", value: "0.68", unit: "ng/dL", refRange: "0.82 - 1.77", minRef: 0.82, maxRef: 1.77, status: "Low" }
    ],
    interpretation: "TSH is elevated alongside depressed levels of both Free T3 and Free T4. This biochemical pattern is consistent with primary hypothyroidism. Clinical correlation with symptoms (fatigue, weight gain, cold intolerance) is advised. Initiating or adjusting thyroid hormone replacement therapy (Levothyroxine) is recommended under endocrine supervision."
  },
  {
    id: "REP-2026-104",
    patientName: "Elena Rostova",
    age: 29,
    gender: "Female",
    phone: "+91 97113 54321",
    email: "elena.rostova@icloud.com",
    referredBy: "Dr. Anita Goel, MD (General Medicine)",
    dateCollected: "2026-06-09T08:00",
    dateReported: "2026-06-09T17:00",
    testType: "Liver Function Test (LFT)",
    status: "Completed",
    parameters: [
      { name: "Total Bilirubin", value: "0.90", unit: "mg/dL", refRange: "0.20 - 1.20", minRef: 0.20, maxRef: 1.20, status: "Normal" },
      { name: "Direct Bilirubin", value: "0.25", unit: "mg/dL", refRange: "< 0.30", maxRef: 0.30, status: "Normal" },
      { name: "Indirect Bilirubin", value: "0.65", unit: "mg/dL", refRange: "0.20 - 0.80", minRef: 0.20, maxRef: 0.80, status: "Normal" },
      { name: "SGPT (ALT)", value: "78", unit: "U/L", refRange: "7 - 56", minRef: 7, maxRef: 56, status: "High" },
      { name: "SGOT (AST)", value: "65", unit: "U/L", refRange: "10 - 40", minRef: 10, maxRef: 40, status: "High" },
      { name: "Alkaline Phosphatase (ALP)", value: "90", unit: "U/L", refRange: "44 - 147", minRef: 44, maxRef: 147, status: "Normal" },
      { name: "Total Protein", value: "7.1", unit: "g/dL", refRange: "6.0 - 8.3", minRef: 6.0, maxRef: 8.3, status: "Normal" },
      { name: "Albumin", value: "4.2", unit: "g/dL", refRange: "3.5 - 5.0", minRef: 3.5, maxRef: 5.0, status: "Normal" },
      { name: "Globulin", value: "2.9", unit: "g/dL", refRange: "2.3 - 3.5", minRef: 2.3, maxRef: 3.5, status: "Normal" }
    ],
    interpretation: "Mild to moderate elevation of transaminases (SGPT/ALT and SGOT/AST) with normal bilirubin and alkaline phosphatase. This indicates mild hepatocellular injury, which can be seen in fatty liver, medication-induced stress, or early viral infection. Recommend clinical correlation regarding alcohol use, OTC drug history, and an ultrasound of the upper abdomen."
  },
  {
    id: "REP-2026-105",
    patientName: "Marcus Vance",
    age: 65,
    gender: "Male",
    phone: "+91 99532 99881",
    email: "marcus.vance@yahoo.com",
    referredBy: "Dr. Suresh Gupta, MD (Nephrology)",
    dateCollected: "2026-06-06T10:00",
    dateReported: "2026-06-06T18:30",
    testType: "Kidney Function Test (RFT/KFT)",
    status: "Completed",
    parameters: [
      { name: "Blood Urea Nitrogen (BUN)", value: "14.0", unit: "mg/dL", refRange: "7 - 20", minRef: 7, maxRef: 20, status: "Normal" },
      { name: "Serum Creatinine", value: "0.95", unit: "mg/dL", refRange: "0.60 - 1.30", minRef: 0.60, maxRef: 1.30, status: "Normal" },
      { name: "Uric Acid", value: "5.40", unit: "mg/dL", refRange: "3.5 - 7.2", minRef: 3.5, maxRef: 7.2, status: "Normal" },
      { name: "eGFR", value: "92", unit: "mL/min/1.73m²", refRange: "> 90", minRef: 90, status: "Normal" }
    ],
    interpretation: "Renal profile values are completely within normal physiological reference ranges. Blood Urea Nitrogen (BUN), Serum Creatinine, and Uric Acid show normal clearance rates. The estimated Glomerular Filtration Rate (eGFR > 90) indicates adequate renal function corresponding to Stage 1 clearance capacity (Normal)."
  },
  {
    id: "REP-2026-106",
    patientName: "Aisha Rahman",
    age: 51,
    gender: "Female",
    phone: "+91 88266 01928",
    email: "aisha.rahman@rediffmail.com",
    referredBy: "Dr. P. N. Saxena, MD (Diabetology)",
    dateCollected: "2026-06-09T08:15",
    dateReported: "2026-06-09T14:30",
    testType: "Diabetes Panel",
    status: "Critical",
    parameters: [
      { name: "HbA1c (Glycated Hemoglobin)", value: "8.2", unit: "%", refRange: "4.0 - 5.6 (Normal)", minRef: 4.0, maxRef: 5.6, status: "High" },
      { name: "Fasting Blood Sugar (FBS)", value: "156", unit: "mg/dL", refRange: "70 - 99", minRef: 70, maxRef: 99, status: "High" },
      { name: "Post Prandial Blood Sugar (PPBS)", value: "232", unit: "mg/dL", refRange: "< 140", maxRef: 140, status: "High" }
    ],
    interpretation: "CRITICAL: Glucose indices and HbA1c are significantly elevated, indicating poorly controlled hyperglycemia. An HbA1c of 8.2% corresponds to an average blood glucose level of approximately 190 mg/dL over the past 3 months. Immediate clinical consultation is required to initiate/adjust pharmacological therapy (metformin/insulin) and structure diabetic nutrition guidelines."
  },
  {
    id: "REP-2026-107",
    patientName: "David Miller",
    age: 38,
    gender: "Male",
    phone: "+91 98108 55667",
    email: "david.miller@gmail.com",
    referredBy: "Dr. Robert H. Vance, MD",
    dateCollected: "2026-06-10T11:00",
    dateReported: "2026-06-10T15:00",
    testType: "Electrolytes Panel",
    status: "Completed",
    parameters: [
      { name: "Sodium (Na+)", value: "138", unit: "mEq/L", refRange: "135 - 145", minRef: 135, maxRef: 145, status: "Normal" },
      { name: "Potassium (K+)", value: "4.1", unit: "mEq/L", refRange: "3.5 - 5.1", minRef: 3.5, maxRef: 5.1, status: "Normal" },
      { name: "Chloride (Cl-)", value: "101", unit: "mEq/L", refRange: "96 - 106", minRef: 96, maxRef: 106, status: "Normal" },
      { name: "Bicarbonate (HCO3-)", value: "24", unit: "mEq/L", refRange: "22 - 29", minRef: 22, maxRef: 29, status: "Normal" }
    ],
    interpretation: "Serum electrolyte values indicate normal electrolyte and acid-base balance. Sodium, Potassium, Chloride, and Bicarbonate levels are all stable and within expected thresholds. No clinical indication of metabolic acidosis/alkalosis, dehydration, or renal retention of electrolytes."
  },
  {
    id: "REP-2026-108",
    patientName: "Emily Watson",
    age: 24,
    gender: "Female",
    phone: "+91 93110 44332",
    email: "emily.watson@gmail.com",
    referredBy: "Dr. Neha Sharma, MBBS",
    dateCollected: "2026-06-09T10:00",
    dateReported: "2026-06-09T16:00",
    testType: "Urine Routine Analysis",
    status: "Completed",
    parameters: [
      { name: "Color", value: "Pale Yellow", unit: "", refRange: "Pale Yellow", status: "Normal" },
      { name: "Transparency", value: "Slightly Cloudy", unit: "", refRange: "Clear", status: "Abnormal" },
      { name: "Specific Gravity", value: "1.020", unit: "", refRange: "1.005 - 1.030", minRef: 1.005, maxRef: 1.030, status: "Normal" },
      { name: "pH", value: "6.5", unit: "", refRange: "5.0 - 8.0", minRef: 5.0, maxRef: 8.0, status: "Normal" },
      { name: "Protein", value: "Trace", unit: "", refRange: "Negative", status: "Abnormal" },
      { name: "Glucose", value: "Negative", unit: "", refRange: "Negative", status: "Normal" },
      { name: "Nitrite", value: "Positive", unit: "", refRange: "Negative", status: "Abnormal" },
      { name: "Leucocytes", value: "18", unit: "/hpf", refRange: "< 5", maxRef: 5, status: "High" },
      { name: "RBCs", value: "3", unit: "/hpf", refRange: "< 5", maxRef: 5, status: "Normal" }
    ],
    interpretation: "Urine analysis reveals positive Nitrite, presence of trace Protein, and significantly elevated Leucocytes (18/hpf) in slightly cloudy urine. These findings are highly suggestive of a lower urinary tract infection (UTI). Recommend clinical correlation with symptoms (dysuria, frequency) and initiating urine culture and sensitivity testing."
  },
  {
    id: "REP-2026-109",
    patientName: "Carlos Santana",
    age: 47,
    gender: "Male",
    phone: "+91 98188 88990",
    email: "carlos.santana@gmail.com",
    referredBy: "Dr. Anita Goel, MD (General Medicine)",
    dateCollected: "2026-06-05T09:30",
    dateReported: "2026-06-05T18:00",
    testType: "Vitamin Profile",
    status: "Completed",
    parameters: [
      { name: "Vitamin D3 (25-OH)", value: "12.5", unit: "ng/mL", refRange: "30.0 - 100.0 (Sufficiency)", minRef: 30, maxRef: 100, status: "Low" },
      { name: "Vitamin B12", value: "380", unit: "pg/mL", refRange: "211 - 911", minRef: 211, maxRef: 911, status: "Normal" }
    ],
    interpretation: "Vitamin D3 (25-OH) is severely deficient (12.5 ng/mL, sufficiency defined as >30 ng/mL). Low Vitamin D levels are associated with compromised bone density, muscle weakness, and immunological susceptibility. Vitamin B12 level is normal. It is advised to start therapeutic Vitamin D3 supplementation (e.g. 60,000 IU weekly for 8 weeks followed by maintenance) under physician advice."
  },
  {
    id: "REP-2026-110",
    patientName: "Arthur Pendelton",
    age: 72,
    gender: "Male",
    phone: "+91 99119 77665",
    email: "arthur.p12@gmail.com",
    referredBy: "Dr. J. P. Deshmukh, DM (Cardiology)",
    dateCollected: "2026-06-10T12:00",
    dateReported: "2026-06-10T14:30",
    testType: "Cardiac Biomarkers Panel",
    status: "Completed",
    parameters: [
      { name: "Troponin I (Ultra-sensitive)", value: "< 0.01", unit: "ng/mL", refRange: "< 0.04", maxRef: 0.04, status: "Normal" },
      { name: "CK-MB", value: "1.8", unit: "ng/mL", refRange: "< 5.0", maxRef: 5.0, status: "Normal" },
      { name: "Myoglobin", value: "42.0", unit: "ng/mL", refRange: "< 90", maxRef: 90, status: "Normal" }
    ],
    interpretation: "Cardiac markers Troponin I, CK-MB, and Myoglobin are all safely within the normal range. There is no biological indication of active acute myocardial necrosis or coronary syndrome. Recommend correlating with ECG telemetry, patient physical symptoms, and history of exertion. Re-testing is recommended in 6 hours if symptoms persist."
  }
];
