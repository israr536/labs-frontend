export type FaqItem = { question: string; answer: string; group: string };

export const faqGroups = [
  {
    label: 'Getting started',
    items: [
      {
        question: 'What is PathMLT?',
        answer: 'PathMLT is laboratory reporting and workflow software for diagnostic and pathology laboratories. It connects patient records, orders, tests, samples, results, verification, report generation, and report sharing in one workspace.',
      },
      {
        question: 'Who is PathMLT designed for?',
        answer: 'PathMLT is designed for diagnostic laboratories, pathology laboratories, hospital laboratories, and independent labs that want a more consistent way to manage testing and reporting.',
      },
      {
        question: 'What should we configure first?',
        answer: 'Begin with your laboratory identity, report standards, core test catalog, parameters, reference information, and user responsibilities. Then complete one representative order from patient registration through final report.',
      },
      {
        question: 'Can PathMLT fit our existing laboratory workflow?',
        answer: 'Yes. The workspace is configured around your tests, specimen types, methods, parameters, reference ranges, report presentation, and team responsibilities. Your laboratory remains responsible for defining the workflow and policies that apply to its operation.',
      },
      {
        question: 'Can administrators add new tests?',
        answer: 'Yes. Administrators can add available catalog tests to the laboratory workspace and configure the parameters used during result entry, verification, and reporting.',
      },
    ],
  },
  {
    label: 'Laboratory reporting',
    items: [
      {
        question: 'What does the PathMLT reporting workflow include?',
        answer: 'A typical workflow starts with patient registration and an order. The team then connects samples and configured tests, enters results, reviews required values and flags, verifies the result set, and generates the final laboratory report.',
      },
      {
        question: 'Does PathMLT support multi-test or combined reports?',
        answer: 'Yes. Combined panels and multi-test orders can be managed in one workflow, with each configured parameter available for review before the report is finalized.',
      },
      {
        question: 'Can we enter numeric and qualitative results?',
        answer: 'The test catalog supports structured parameters for numeric, text, select, multiline, boolean, date, and qualitative result entry, subject to the laboratory configuration.',
      },
      {
        question: 'Can we print and download PDF laboratory reports?',
        answer: 'Yes. Finalized reports can be previewed, printed, and downloaded as professional PDF documents. The report presentation can use your configured laboratory identity and layout standards.',
      },
      {
        question: 'Can we share completed reports?',
        answer: 'Completed reports can be downloaded or printed. The application also provides supported device sharing and messaging options for laboratories that need to send a completed report to an authorized recipient.',
      },
      {
        question: 'Can we create reusable report templates?',
        answer: 'Yes. Report templates help laboratories keep recurring report structure, identity, parameter presentation, and final-document formatting consistent across patients and orders.',
      },
    ],
  },
  {
    label: 'Verification and governance',
    items: [
      {
        question: 'How does result verification work?',
        answer: 'Results are entered against configured test parameters and then reviewed before finalization. The verification step gives an authorized team member a deliberate place to check required values, flags, reference information, and report context.',
      },
      {
        question: 'Does PathMLT maintain an audit trail?',
        answer: 'PathMLT records relevant workflow events and user activity so authorized administrators can review activity around reports, orders, patients, settings, and approvals.',
      },
      {
        question: 'Can different team members have different responsibilities?',
        answer: 'Yes. Authenticated roles and role-aware controls help separate administrative, technical, and operational responsibilities. Laboratories remain responsible for assigning appropriate access.',
      },
      {
        question: 'Who is responsible for patient-data policies?',
        answer: 'Your laboratory remains responsible for the information entered into the workspace, including accuracy, lawful use, retention, permissions, and compliance with the requirements that apply to its jurisdiction and operating model.',
      },
    ],
  },
  {
    label: 'Plans and implementation',
    items: [
      {
        question: 'Is there a free trial?',
        answer: 'PathMLT currently provides a 30-day free trial. After the trial, a laboratory can choose a Monthly or Yearly plan to continue workspace access.',
      },
      {
        question: 'Are report-generation limits applied to paid plans?',
        answer: 'The current Monthly and Yearly plans are configured without a plan-level order or report-generation cap. Confirm the latest plan terms with the PathMLT team before making a purchasing decision.',
      },
      {
        question: 'How quickly can we start using PathMLT?',
        answer: 'The timeline depends on your test catalog, report standards, team setup, and implementation needs. Most teams can begin with their laboratory identity, core tests, users, and a representative order.',
      },
      {
        question: 'Can I book a product demonstration?',
        answer: 'Yes. Use the contact form or the WhatsApp demo link to discuss your laboratory, common panels, reporting requirements, and implementation questions with the PathMLT team.',
      },
    ],
  },
] as const;

export const faqItems: FaqItem[] = faqGroups.flatMap(group =>
  group.items.map(item => ({ ...item, group: group.label })),
);

export default faqItems;
