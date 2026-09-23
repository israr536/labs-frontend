export type FaqItem = { question: string; answer: string; group: string };

export const faqGroups = [
  { label: 'Implementation', items: [
    { question: 'How quickly can we start using PathMLT?', answer: 'Most laboratories can begin after their workspace identity, core test catalog, users, and report standards are configured. The exact timeline depends on your operating model and whether you need custom templates or implementation support.' },
    { question: 'What should we configure first?', answer: 'Start with laboratory identity and report standards, activate the panels you run most often, establish reference ranges, invite the operational team, and complete a representative test order.' },
    { question: 'Can PathMLT fit our existing workflow?', answer: 'PathMLT is designed to be configured around your tests, specimen types, methods, reference ranges, report identity, role boundaries, and team responsibilities.' },
  ]},
  { label: 'Reporting operations', items: [
    { question: 'Does the platform support multi-test reports?', answer: 'Yes. Combined panels and multi-test orders can be managed in one workflow, with each parameter presented clearly for verification and final report generation.' },
    { question: 'Can we print and download PDF reports?', answer: 'Yes. Reports can be previewed, printed, and downloaded as A4 PDF documents. Templates can be configured to reflect your laboratory identity and presentation standards.' },
    { question: 'Are there limits on report generation in paid plans?', answer: 'The current Monthly and Yearly PathMLT plans are configured without an order/report-generation cap, so paid workspaces can generate reports without a plan-level report-count limit.' },\n    { question: 'Can we share completed reports?', answer: 'Yes. Completed reports can be downloaded or printed, and the application provides sharing options that can be used with supported device sharing and messaging apps such as WhatsApp.' },\n    { question: 'Can we customize report templates?', answer: 'Yes. PathMLT supports configurable report layouts and presentation styles so your final documents can align with your laboratory brand and reporting standards.' },
    { question: 'Does PathMLT maintain an audit trail?', answer: 'PathMLT records workflow events and relevant user actions so administrators can review activity around reports, orders, patients, settings, and approvals.' },
  ]},
  { label: 'Access and governance', items: [
    { question: 'How does PathMLT support accountable access?', answer: 'Workspace access is organized around authenticated team members and role boundaries. Laboratories remain responsible for assigning appropriate access and reviewing their operational policies.' },
    { question: 'Can different team members have different responsibilities?', answer: 'Yes. The application uses authenticated roles and role-aware controls so administrative, technician, and other operational responsibilities can be separated.' },
  ]},
  { label: 'Data and next steps', items: [
    { question: 'Who is responsible for patient data policies?', answer: 'Your laboratory remains responsible for the information entered into the workspace, including accuracy, lawful use, retention, permissions, and applicable privacy or healthcare requirements.' },
    { question: 'Can I book a live demo?', answer: 'Yes. Use the contact page or the Book demo on WhatsApp option to schedule a walkthrough around your laboratory workflow.' },
  ]},
] as const;

export const faqItems: FaqItem[] = faqGroups.flatMap(group => group.items.map(item => ({ ...item, group: group.label })));
