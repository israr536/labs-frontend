import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export type SeoPageKey =
  | 'laboratory-reporting-software' | 'diagnostic-lab-software' | 'pathology-lab-software'
  | 'laboratory-management-software' | 'lab-reporting-system' | 'pathology-reporting-software'
  | 'lims-software' | 'lab-automation-software' | 'patient-management' | 'test-management'
  | 'sample-management' | 'result-entry' | 'result-verification' | 'lab-reporting'
  | 'report-templates' | 'reference-ranges' | 'audit-trail' | 'role-based-access'
  | 'pdf-reports' | 'pathology-labs' | 'diagnostic-labs' | 'hospital-labs' | 'independent-labs';

type PageData = {
  eyebrow: string; title: string; description: string; focus: string; audience: string;
  benefits: string[]; steps: [string,string][]; related: SeoPageKey[];
};

// SEO landing page content. Keep each page entry comma-separated so the object remains valid TypeScript.
const common: Record<SeoPageKey, PageData> = {
'laboratory-reporting-software':{eyebrow:'Laboratory reporting software',title:'Laboratory Reporting Software for Diagnostic Labs',description:'Build a reliable reporting workflow from patient registration and testing to result verification and professional PDF reports.',focus:'Keep every reporting stage connected so your team can work from the same patient, order and result context.',audience:'Diagnostic and pathology laboratories that want a structured alternative to spreadsheets and disconnected reporting tools.',benefits:['Patient, order and test context stays connected','Structured result entry with configured parameters','Review and verification before finalization','Reusable report layouts and professional PDF output'],steps:[['Register','Create the patient and order once.'],['Test','Connect samples and enter configured results.'],['Verify','Review flags, ranges and required values.'],['Report','Finalize and generate the patient report.']],related:['diagnostic-lab-software','result-verification','pdf-reports']},
'diagnostic-lab-software':{eyebrow:'Diagnostic laboratory software',title:'Diagnostic Lab Software for Modern Laboratory Operations',description:'Connect patients, orders, tests, samples, results and reports in one diagnostic laboratory workflow.',focus:'Give reception, technicians and administrators a shared operational view instead of scattered handoffs.',audience:'Diagnostic laboratories managing recurring patient, testing and reporting workflows.',benefits:['Patient and order management','Configurable test catalog','Result flags and reference information','Controlled final reporting'],steps:[['Intake','Register patient and order details.'],['Process','Manage testing and sample context.'],['Review','Check results before release.'],['Deliver','Generate the final report.']],related:['laboratory-reporting-software','patient-management','test-management']},
'pathology-lab-software':{eyebrow:'Pathology lab software',title:'Pathology Lab Software for Reporting and Result Workflows',description:'Organize pathology laboratory operations around configurable tests, result review, report templates and controlled finalization.',focus:'Standardize the repeatable operational work around pathology reporting without losing laboratory-specific configuration.',audience:'Pathology laboratories and teams handling structured diagnostic reporting workflows.',benefits:['Configurable pathology test workflows','Parameter and reference configuration','Verification before report release','Traceable reporting history'],steps:[['Configure','Define tests, parameters and report structure.'],['Process','Capture patient and test information.'],['Review','Verify results and required fields.'],['Release','Create the finalized report.']],related:['pathology-reporting-software','result-verification','lab-reporting']},
'laboratory-management-software':{eyebrow:'Laboratory management software',title:'Laboratory Management Software for Growing Diagnostic Teams',description:'Manage patients, tests, samples, results, reports, users and operational controls from one laboratory workspace.',focus:'Replace fragmented operational tools with a clear workspace for the people and workflows that run your laboratory.',audience:'Growing laboratories that need consistent processes and controlled team access.',benefits:['Central operational workspace','Role-aware team access','Searchable workflow records','Connected reporting operations'],steps:[['Organize','Configure your lab and team.'],['Operate','Manage patients, orders and testing.'],['Control','Review permissions and workflow states.'],['Report','Deliver consistent final reports.']],related:['diagnostic-lab-software','role-based-access','audit-trail']},
'lab-reporting-system':{eyebrow:'Lab reporting system',title:'Lab Reporting System from Result Entry to Final PDF',description:'Move structured laboratory results through validation, review and final report generation with a repeatable reporting process.',focus:'Create a defined path from entered result to verified report so final documents are based on controlled data.',audience:'Labs looking to standardize reporting and reduce manual document preparation.',benefits:['Reusable test and report configuration','Result validation and flagging','Finalization controls','PDF report generation'],steps:[['Enter','Record structured laboratory results.'],['Validate','Check values and required parameters.'],['Verify','Review before finalization.'],['Generate','Create the final report.']],related:['laboratory-reporting-software','result-entry','pdf-reports']},
'pathology-reporting-software':{eyebrow:'Pathology reporting software',title:'Pathology Reporting Software for Consistent Reports',description:'Create consistent pathology and diagnostic reports with configurable parameters, reference information and review steps.',focus:'Make report structure repeatable while keeping the laboratory configuration that your team depends on.',audience:'Pathology teams that need consistent, reviewable and patient-ready reporting.',benefits:['Consistent report presentation','Configurable parameters and ranges','Controlled review and finalization','Patient-ready PDF output'],steps:[['Structure','Configure tests and report layouts.'],['Capture','Enter results in context.'],['Review','Verify report data.'],['Finalize','Generate the final document.']],related:['pathology-lab-software','lab-reporting','reference-ranges']},
'lims-software':{eyebrow:'LIMS workflow software',title:'LIMS Software for Laboratory Reporting Workflows',description:'Connect patient, testing, sample, result and reporting workflows with a focused laboratory information system experience.',focus:'Keep the operational chain visible from the first patient record to the final laboratory report.',audience:'Laboratories evaluating LIMS-style workflow software for day-to-day reporting operations.',benefits:['Connected patient and order records','Test and sample workflows','Result entry and verification','Reporting and audit history'],steps:[['Capture','Start with patient and order context.'],['Track','Move work through testing.'],['Verify','Review results and workflow state.'],['Report','Produce the final laboratory report.']],related:['laboratory-management-software','sample-management','audit-trail']},
'lab-automation-software':{eyebrow:'Laboratory automation',title:'Laboratory Automation Software for Reporting Workflows',description:'Reduce repetitive reporting handoffs with configurable workflows, result checks, verification and report generation.',focus:'Automate repeatable checks and document preparation while keeping review and accountability visible.',audience:'Laboratories looking to reduce repetitive administrative reporting work.',benefits:['Reusable test configuration','Automated numeric flags','Controlled report finalization','Searchable workflow history'],steps:[['Configure','Set repeatable test rules.'],['Process','Enter results against the configuration.'],['Check','Surface values that need review.'],['Report','Finalize the report efficiently.']],related:['result-entry','result-verification','lab-reporting']},
'patient-management':{eyebrow:'Patient management',title:'Patient Management Software for Diagnostic Laboratories',description:'Keep patient records, laboratory orders and reports connected with searchable, role-aware patient management.',focus:'Give your team one dependable patient record to follow through the laboratory workflow.',audience:'Reception and laboratory teams handling recurring patient registrations and orders.',benefits:['Central patient records','Searchable patient information','Connected orders and reports','Role-aware access'],steps:[['Register','Capture patient information.'],['Order','Connect laboratory services.'],['Process','Follow the patient through testing.'],['Report','Keep completed reports connected.']],related:['diagnostic-lab-software','test-management','laboratory-management-software']},
'test-management':{eyebrow:'Test catalog management',title:'Laboratory Test Management and Test Catalog Software',description:'Configure laboratory tests, parameters, specimen types and reference information in one reusable test catalog.',focus:'Turn your laboratory\'s recurring test definitions into a consistent configuration used throughout reporting.',audience:'Laboratories maintaining multiple tests, panels, parameters and reporting rules.',benefits:['Organized test catalog','Parameter-level configuration','Sample and department metadata','Reusable reporting structure'],steps:[['Define','Create the laboratory test.'],['Configure','Add parameters and options.'],['Standardize','Attach reference information.'],['Use','Reuse the configuration in reports.']],related:['reference-ranges','result-entry','lab-reporting']},
'sample-management':{eyebrow:'Sample management',title:'Laboratory Sample Management for Traceable Workflows',description:'Keep samples connected to patient orders and testing so laboratory teams can see what is being processed and what comes next.',focus:'Preserve the relationship between sample, patient, order and result throughout the workflow.',audience:'Laboratories that need clearer operational handoffs around specimen processing.',benefits:['Sample-linked orders','Status-aware workflow','Connected results','Clear operational ownership'],steps:[['Receive','Connect the sample to its order.'],['Process','Move it through testing.'],['Record','Attach results to the correct context.'],['Complete','Continue to verification and reporting.']],related:['test-management','result-entry','laboratory-reporting-software']},
'result-entry':{eyebrow:'Laboratory result entry',title:'Laboratory Result Entry Software for Structured Reporting',description:'Enter qualitative and quantitative laboratory results against configured parameters with validation and reference information.',focus:'Make result entry structured enough to support consistent verification and reporting later in the workflow.',audience:'Technicians and laboratory teams entering routine test results.',benefits:['Parameter-specific inputs','Numeric validation','Configured qualitative options','Required-result checks'],steps:[['Open','Select the correct patient and order.'],['Enter','Record each configured parameter.'],['Check','Review validation and flags.'],['Submit','Move results to verification.']],related:['result-verification','reference-ranges','lab-reporting']},
'result-verification':{eyebrow:'Laboratory result verification',title:'Laboratory Result Verification Before Final Report Release',description:'Review laboratory values, flags and required results before reports are finalized and released.',focus:'Put a deliberate review step between result entry and final reporting.',audience:'Laboratory teams responsible for checking results before report release.',benefits:['Role-aware finalization','Flagged-value visibility','Required-result validation','Controlled final-report workflow'],steps:[['Review','Open the completed result set.'],['Check','Inspect values and flags.'],['Verify','Confirm required information.'],['Finalize','Release the report when ready.']],related:['result-entry','audit-trail','pdf-reports']},
'lab-reporting':{eyebrow:'Laboratory reporting',title:'Laboratory Reporting from Verified Results',description:'Turn verified laboratory results into consistent, professional patient reports without rebuilding the same document manually.',focus:'Make the final reporting step a predictable output of the laboratory workflow.',audience:'Labs that want consistent reports built from structured and verified data.',benefits:['Report generation from configured tests','Patient and order context','Final status controls','PDF output'],steps:[['Collect','Use the completed result set.'],['Review','Confirm the report context.'],['Finalize','Lock the reporting state.'],['Deliver','Preview, download or print.']],related:['laboratory-reporting-software','lab-reporting','pdf-reports']},
'report-templates':{eyebrow:'Laboratory report templates',title:'Laboratory Report Templates for Consistent PDF Reporting',description:'Create reusable laboratory report layouts that keep your lab identity, parameters and results consistent across reports.',focus:'Standardize presentation without recreating the same report structure for every patient.',audience:'Laboratories that want repeatable report design and professional PDF output.',benefits:['Reusable layouts','Laboratory identity','Configured parameters and ranges','Consistent PDF presentation'],steps:[['Design','Set the report structure.'],['Configure','Connect fields and parameters.'],['Review','Check the presentation.'],['Reuse','Apply the template to reports.']],related:['pathology-reporting-software','lab-reporting','pdf-reports']},
'reference-ranges':{eyebrow:'Reference range management',title:'Laboratory Reference Range Management Software',description:'Configure parameter-level reference information and keep reporting context consistent with your laboratory workflow.',focus:'Keep reference information close to the result configuration so review and reporting have the right context.',audience:'Laboratories maintaining reference information across many tests and parameters.',benefits:['Parameter-level reference data','Clear display ranges','Result flagging','Historical reporting context'],steps:[['Define','Set reference information.'],['Attach','Connect it to test parameters.'],['Review','Use it during result checking.'],['Report','Preserve the reporting context.']],related:['test-management','result-entry','lab-reporting']},
'audit-trail':{eyebrow:'Laboratory audit trail',title:'Laboratory Audit Trail and Workflow History',description:'Keep important laboratory workflow events, actors and approvals traceable with an operational audit history.',focus:'Make important changes and workflow actions easier to understand after they happen.',audience:'Laboratory administrators and teams that need traceable operational history.',benefits:['Recorded workflow events','Actor and entity context','Approval history','Administrative visibility'],steps:[['Act','A user performs a workflow action.'],['Record','The event is captured.'],['Review','Authorized users inspect history.'],['Trace','Use the history to understand workflow activity.']],related:['role-based-access','result-verification','laboratory-management-software']},
'role-based-access':{eyebrow:'Laboratory access control',title:'Role-Based Access for Laboratory Teams',description:'Give laboratory teams controlled access to the workflows and responsibilities relevant to their roles.',focus:'Separate responsibilities so users see and perform the work appropriate to their role.',audience:'Laboratories with reception, technician and administrative responsibilities.',benefits:['Role-aware application access','Restricted report finalization','Administrative controls','Authenticated team workspace'],steps:[['Assign','Give users the appropriate role.'],['Access','Apply role-aware permissions.'],['Work','Complete permitted laboratory tasks.'],['Control','Keep sensitive actions restricted.']],related:['audit-trail','laboratory-management-software','result-verification']},
'pdf-reports':{eyebrow:'PDF laboratory reports',title:'PDF Lab Report Software for Diagnostic Laboratories',description:'Generate professional PDF laboratory reports from finalized results using consistent report data and presentation.',focus:'Turn verified laboratory data into a clean final document ready for patient delivery.',audience:'Labs that need dependable, consistent PDF report generation.',benefits:['A4 report generation','Consistent formatting','Finalized-result requirement','Preview and download'],steps:[['Prepare','Complete and verify results.'],['Render','Apply the configured report structure.'],['Review','Preview the final document.'],['Deliver','Download or print the report.']],related:['lab-reporting','lab-reporting','laboratory-reporting-software']},
'pathology-labs':{eyebrow:'For pathology laboratories',title:'Laboratory Software for Pathology Labs',description:'Connect pathology laboratory teams around patients, tests, results, verification and controlled report delivery.',focus:'Support the repeatable reporting workflow that pathology teams manage every day.',audience:'Pathology laboratories and diagnostic teams.',benefits:['Pathology-focused reporting workflow','Configurable test catalog','Verification before finalization','Traceable reporting history'],steps:[['Register','Capture patient and order context.'],['Process','Manage configured tests and results.'],['Verify','Review before finalization.'],['Report','Deliver the final report.']],related:['pathology-lab-software','pathology-reporting-software','lab-reporting']},
'diagnostic-labs':{eyebrow:'For diagnostic laboratories',title:'Software for Diagnostic Laboratories',description:'Standardize day-to-day diagnostic laboratory operations from patient registration to verified report delivery.',focus:'Give diagnostic lab teams a connected operational path through their daily workload.',audience:'Independent and diagnostic laboratory operations teams.',benefits:['Patient and order management','Multi-test reporting','Result validation','PDF report generation'],steps:[['Register','Create patient and order records.'],['Test','Process the laboratory work.'],['Verify','Review results.'],['Deliver','Generate the final report.']],related:['diagnostic-lab-software','laboratory-reporting-software','result-verification']},
'hospital-labs':{eyebrow:'For hospital laboratories',title:'Laboratory Workflow Software for Hospital Labs',description:'Organize hospital laboratory testing and reporting around patients, orders, results, team roles and final reports.',focus:'Create a clearer operational workflow for hospital laboratory teams handling many connected orders.',audience:'Hospital laboratory teams and administrators.',benefits:['Role-aware operational access','Connected patient and order data','Result verification','Traceable reporting history'],steps:[['Receive','Start with patient and order context.'],['Process','Coordinate testing workflows.'],['Verify','Review results before release.'],['Report','Generate the final laboratory report.']],related:['laboratory-management-software','role-based-access','lab-reporting']},
'independent-labs':{eyebrow:'For independent laboratories',title:'Software for Independent Diagnostic Laboratories',description:'Give independent diagnostic laboratories a practical workspace for patients, testing, reporting and operational controls.',focus:'Standardize core laboratory work without forcing a growing team into disconnected systems.',audience:'Independent diagnostic laboratories and growing lab businesses.',benefits:['Fast workflow standardization','Configurable tests and reports','Team access controls','Scalable reporting operations'],steps:[['Set up','Configure your core laboratory workflow.'],['Operate','Manage patients and testing.'],['Control','Review results and responsibilities.'],['Grow','Expand your reporting workflow as volume increases.']],related:['diagnostic-lab-software','laboratory-management-software','lab-reporting']}
};


type SeoDepth = {
  useCases: string[];
  faq: [string, string][];
};

export const seoDepth: Record<string, SeoDepth> = {
'laboratory-reporting-software': {
  useCases: ['Standardize patient-to-report workflows across routine diagnostic testing.', 'Give reviewers a consistent place to check results before release.', 'Generate patient-ready reports from the same structured data used during testing.'],
  faq: [['Can PathMLT support the full reporting workflow?', 'PathMLT is designed around connected patient, order, test, result, verification and reporting workflows so teams can move between stages without rebuilding the same information.'], ['Who is laboratory reporting software for?', 'It is intended for diagnostic and pathology laboratories that need a structured reporting workspace for recurring laboratory operations.']]
},
'diagnostic-lab-software': {
  useCases: ['Coordinate reception, testing and reporting around shared patient and order records.', 'Standardize recurring diagnostic tests and result entry.', 'Keep verification and final report delivery as explicit workflow stages.'],
  faq: [['What does diagnostic lab software manage?', 'A laboratory workspace can connect patient records, orders, tests, samples, results, verification and final reports in one operational flow.'], ['Is PathMLT designed for diagnostic laboratories?', 'The public PathMLT workflow is designed around diagnostic laboratory operations and reporting.']]
},
'pathology-lab-software': {
  useCases: ['Configure pathology-oriented tests and report structures.', 'Capture structured results with the context needed for review.', 'Keep report finalization separate from result entry.'],
  faq: [['How does PathMLT support pathology workflows?', 'PathMLT connects configurable tests, result entry, review and report generation so pathology teams can use a repeatable reporting process.'], ['Can report layouts be reused?', 'PathMLT supports reusable reporting structures so teams do not have to recreate the same presentation for every patient.']]
},
'laboratory-management-software': {
  useCases: ['Bring patient, testing and reporting operations into one workspace.', 'Give different team members controlled access to relevant tasks.', 'Maintain workflow history alongside day-to-day laboratory operations.'],
  faq: [['What is laboratory management software?', 'It is software that coordinates core laboratory operations such as patients, tests, samples, results, users and reporting from a shared system.'], ['Who benefits from a laboratory management workspace?', 'Growing diagnostic laboratories can use a connected workspace to standardize recurring operational processes and team responsibilities.']]
},
'lab-reporting-system': {
  useCases: ['Move results through validation before review.', 'Separate verification from final report generation.', 'Produce consistent reports from structured laboratory data.'],
  faq: [['What makes a lab reporting system different from a document editor?', 'A reporting system connects the report to structured patient, order and result data instead of treating every report as an independently recreated document.'], ['Can results be reviewed before a report is released?', 'Yes. The PathMLT workflow includes a distinct verification stage before final reporting.']]
},
'pathology-reporting-software': {
  useCases: ['Create repeatable pathology report structures.', 'Review configured parameters and reference information before release.', 'Generate consistent patient-facing output.'],
  faq: [['What is pathology reporting software used for?', 'It helps pathology teams organize structured results, review them and turn verified information into consistent reports.'], ['Can pathology reports use configured parameters?', 'PathMLT is built around configurable tests and parameters that can be reused during result entry and reporting.']]
},
'lims-software': {
  useCases: ['Connect patient and order records to laboratory work.', 'Track sample and result context through testing.', 'Keep verification and reporting connected to the operational record.'],
  faq: [['Is PathMLT a LIMS?', 'PathMLT provides a focused laboratory information workflow covering patient, testing, result verification and reporting capabilities.'], ['What workflows can a LIMS-style system connect?', 'A connected laboratory system can link patients, orders, tests, samples, results, verification and reports.']]
},
'lab-automation-software': {
  useCases: ['Reduce repetitive result-checking work with configured rules.', 'Standardize recurring test and report configurations.', 'Make the path from completed results to final reports more repeatable.'],
  faq: [['What can laboratory reporting automation improve?', 'Automation can reduce repetitive checks and document preparation while keeping human review and finalization visible.'], ['Does automation remove result verification?', 'The PathMLT workflow keeps verification as an explicit review stage rather than treating automation as a replacement for accountable review.']]
},
'patient-management': {
  useCases: ['Create a patient once and reuse that context across orders.', 'Find patient information without recreating records.', 'Keep completed laboratory reports associated with the patient workflow.'],
  faq: [['Why does patient management matter in a laboratory system?', 'A consistent patient record provides the context that connects orders, testing and reports throughout the laboratory workflow.'], ['Can patient information connect to laboratory orders?', 'PathMLT is designed around connected patient and order records rather than isolated data entry screens.']]
},
'test-management': {
  useCases: ['Maintain a reusable catalog of laboratory tests.', 'Configure parameters and result options for recurring testing.', 'Keep reference information close to the test configuration.'],
  faq: [['What is laboratory test management?', 'It is the configuration layer for tests, parameters, options and related reporting information used throughout laboratory workflows.'], ['Why use a centralized test catalog?', 'A reusable catalog reduces repeated configuration and gives result entry and reporting a consistent definition of each test.']]
},
'sample-management': {
  useCases: ['Keep samples associated with the correct patient and order.', 'Give teams a clearer view of processing status.', 'Carry sample context forward into result entry and reporting.'],
  faq: [['What does sample management track?', 'Sample management connects specimens to patient orders and the laboratory work performed on them.'], ['Why connect samples to results?', 'Keeping the relationship intact helps teams associate results with the correct patient and testing context.']]
},
'result-entry': {
  useCases: ['Enter numeric and qualitative results against configured parameters.', 'Apply validation before results move to review.', 'Keep result data structured for downstream reporting.'],
  faq: [['What is structured laboratory result entry?', 'It means recording results against predefined test parameters and input rules instead of entering free-form report text.'], ['Can result entry include validation?', 'PathMLT is designed to support parameter-specific inputs, validation and required-result checks before verification.']]
},
'result-verification': {
  useCases: ['Review values and flags before report release.', 'Check that required parameters are complete.', 'Keep finalization as a controlled workflow action.'],
  faq: [['Why have a separate result verification stage?', 'Separating entry from verification gives the laboratory a deliberate checkpoint before information becomes a final patient report.'], ['What can reviewers check?', 'The workflow can surface values, flags and required-result status so reviewers can inspect the completed result set.']]
},
'lab-reporting': {
  useCases: ['Build final reports from verified laboratory results.', 'Keep patient and order context attached to the report.', 'Deliver consistent output without manually rebuilding documents.'],
  faq: [['What is laboratory reporting software used for?', 'It turns structured and reviewed laboratory results into consistent final patient reports.'], ['Can reports be generated after verification?', 'Yes. PathMLT places final reporting after the result verification stage in its workflow.']]
},
'reference-ranges': {
  useCases: ['Maintain parameter-level reference information.', 'Use configured reference context during result review.', 'Keep reporting information consistent across recurring tests.'],
  faq: [['Why manage reference ranges with test configuration?', 'Keeping reference information with the relevant parameter makes it available in the same workflow used for result entry and review.'], ['Can reference information support result flags?', 'Configured reference information can provide context for identifying values that require review.']]
},
'audit-trail': {
  useCases: ['Review important workflow events after they occur.', 'Understand which user or role performed an action.', 'Support administrative review of approvals and workflow history.'],
  faq: [['What is a laboratory audit trail?', 'It is a history of relevant system activity that helps authorized users understand changes and workflow actions.'], ['Why is workflow history useful?', 'Traceable history can help laboratory administrators investigate what happened during an operational process.']]
},
'role-based-access': {
  useCases: ['Separate administrative and operational responsibilities.', 'Restrict sensitive workflow actions to appropriate roles.', 'Give team members access aligned with their laboratory responsibilities.'],
  faq: [['What is role-based access in laboratory software?', 'It assigns application permissions according to defined user roles and responsibilities.'], ['Why restrict report finalization?', 'Separating finalization from routine entry can create clearer accountability around who is authorized to release reports.']]
},
'pdf-reports': {
  useCases: ['Generate consistent patient-ready PDF reports.', 'Preserve configured laboratory data in the final document.', 'Preview and download completed reports for delivery.'],
  faq: [['What is PDF lab report software?', 'It converts finalized laboratory result data into a consistent document format suitable for patient delivery or printing.'], ['When should a PDF report be generated?', 'The PathMLT workflow places PDF generation after result review and finalization so the document reflects the completed result set.']]
},
'pathology-labs': {
  useCases: ['Connect pathology patients, tests and results.', 'Standardize review before pathology report release.', 'Reuse reporting structures for recurring laboratory work.'],
  faq: [['What software workflows are relevant to pathology labs?', 'Common needs include patient and order management, configurable tests, result entry, verification and final report generation.'], ['Can pathology teams use reusable reporting structures?', 'Yes. Reusable report structures can help keep recurring patient reports consistent.']]
},
'diagnostic-labs': {
  useCases: ['Manage recurring diagnostic patient and order workflows.', 'Support multiple tests within a connected laboratory process.', 'Move verified results into final reports.'],
  faq: [['What should diagnostic laboratory software connect?', 'A connected workflow can link patients, orders, tests, results, verification and final reports.'], ['Can diagnostic labs standardize reporting?', 'A reusable test and report configuration can provide a consistent process for recurring diagnostic work.']]
},
'hospital-labs': {
  useCases: ['Coordinate high-volume patient and order workflows.', 'Separate team responsibilities with role-aware access.', 'Keep verification and reporting connected to laboratory operations.'],
  faq: [['What does software need to support in a hospital laboratory?', 'Hospital laboratory workflows commonly require connected patient and order data, testing, review, team access and reporting.'], ['Can laboratory roles be separated?', 'Role-aware access can help assign different permissions to operational and administrative users.']]
},
'independent-labs': {
  useCases: ['Standardize core workflows without multiple disconnected tools.', 'Configure recurring tests and reports once for reuse.', 'Add stronger operational controls as the laboratory grows.'],
  faq: [['Who is independent laboratory software for?', 'It is suited to independent diagnostic laboratories looking for a connected workspace for recurring patient, testing and reporting operations.'], ['Can a growing laboratory start with core workflows?', 'A focused implementation can begin with core patient, test and reporting processes and expand as operational needs grow.']]
}
};

export default function SeoLandingPage({ pageKey }: { pageKey: SeoPageKey }) {
  const page = common[pageKey];
  const depth = seoDepth[pageKey];
  const workflowTitle = `How ${page.eyebrow.toLowerCase()} fits into a laboratory workflow`;
  const capabilityTitle = `Capabilities to evaluate for ${page.eyebrow.toLowerCase()}`;
  const useCaseTitle = `Practical ${page.eyebrow.toLowerCase()} use cases`;

  return <div className="public-saas-page seo-landing-page">
    <nav className="seo-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span>{page.title}</span></nav>

    <section className="seo-landing-hero">
      <div>
        <span className="public-eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <div className="seo-actions"><Link className="landing-primary" to="/signup">Create your laboratory workspace <ArrowRight size={16}/></Link><Link className="landing-secondary" to="/contact">Talk to the team</Link></div>
      </div>
      <div className="seo-hero-card"><ShieldCheck size={22}/><strong>{page.eyebrow}: what the workflow should achieve</strong><p>{page.focus} The goal is a clear operational handoff from the work your team performs to the information the next person needs.</p></div>
    </section>

    <section className="seo-intent">
      <div className="landing-section-heading">
        <span className="landing-eyebrow">Why this workflow matters</span>
        <h2>{page.focus}</h2>
        <p><strong>Designed for:</strong> {page.audience}</p>
      </div>
    </section>

    <section className="seo-workflow" aria-labelledby="seo-workflow-title">
      <div className="landing-section-heading">
        <span className="landing-eyebrow">{page.eyebrow}</span>
        <h2 id="seo-workflow-title">{workflowTitle}.</h2>
        <p>These stages describe the operational path for this specific use case. The exact sequence and responsibilities should reflect the laboratory's own configured process.</p>
      </div>
      <div className="seo-workflow-grid">{page.steps.map(([title,text],i)=><article key={title}><span>{String(i+1).padStart(2,'0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="seo-benefits">
      <div className="landing-section-heading">
        <span className="landing-eyebrow">What to look for</span>
        <h2>{capabilityTitle}.</h2>
        <p>Useful laboratory software should support the specific work behind this search intent, not simply provide a generic document editor or a collection of disconnected screens.</p>
      </div>
      <div className="seo-benefit-grid">{page.benefits.map(item=><article key={item}><CheckCircle2 size={17}/><span>{item}</span></article>)}</div>
    </section>

    <section className="seo-use-cases">
      <div className="landing-section-heading">
        <span className="landing-eyebrow">Operational scenarios</span>
        <h2>{useCaseTitle}.</h2>
        <p>Consider how this capability affects the people, records and handoffs involved in day-to-day laboratory work.</p>
      </div>
      <div className="seo-use-case-grid">{depth.useCases.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,'0')}</span><p>{item}</p></article>)}</div>
    </section>

    <section className="seo-faq" aria-labelledby="seo-faq-title">
      <div className="landing-section-heading">
        <span className="landing-eyebrow">Questions to consider</span>
        <h2 id="seo-faq-title">Common questions about {page.eyebrow.toLowerCase()}.</h2>
      </div>
      <div className="seo-faq-list">{depth.faq.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>

    <section className="seo-related">
      <div><span className="landing-eyebrow">Related workflows</span><h2>See how this connects to the rest of the laboratory.</h2><p>Explore adjacent PathMLT workflows rather than treating this capability as an isolated feature.</p></div>
      <div className="seo-related-links">{page.related.filter((slug,index,array)=>array.indexOf(slug)===index).map(slug=><Link key={slug} to={'/'+slug}><span>{common[slug].title}</span><ArrowRight size={14}/></Link>)}</div>
    </section>

    <section className="landing-cta">
      <div><span className="landing-eyebrow">Apply the workflow</span><h2>See how {page.eyebrow.toLowerCase()} could fit your laboratory.</h2><p>Start with the process your team performs most often and discuss the configuration, reporting and access requirements that matter to you.</p></div>
      <Link className="landing-primary" to="/contact">Request a PathMLT walkthrough <ArrowRight size={16}/></Link>
    </section>
  </div>;
}
