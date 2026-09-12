import { ArrowRight, BarChart3, Check, ClipboardList, Download, Eye, FileCheck2, ShieldCheck, Sparkles, Users2, Zap } from 'lucide-react';
import { useState } from 'react';

type Props = { onLoginClick: () => void; onSignupClick: () => void };

const capabilities = [
	{
		icon: FileCheck2,
		title: 'Structured reporting',
		text: 'Move from test results to polished, review-ready reports with a consistent workflow.',
	},
	{
		icon: Users2,
		title: 'Patient workspace',
		text: 'Keep patient, order, sample and report information connected in one secure workspace.',
	},
	{
		icon: ShieldCheck,
		title: 'Controlled access',
		text: 'Give administrators, technicians and reception teams the right level of access.',
	},
	{
		icon: BarChart3,
		title: 'Operational visibility',
		text: 'See queues, approvals, critical work and usage without digging through spreadsheets.',
	},
];

const testGroups = [
	{
		name: 'Complete Blood Count (CBC)',
		tests: ['Hemoglobin', 'RBC', 'WBC', 'Platelets', 'MCV', 'MCH']
	},
	{
		name: 'Basic Metabolic Panel',
		tests: ['Glucose', 'Urea (BUN)', 'Creatinine', 'Sodium', 'Potassium', 'Chloride']
	},
	{
		name: 'Lipid Profile',
		tests: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides']
	},
		{
			name: 'Thyroid Panel',
			tests: ['TSH', 'Free T4', 'Free T3']
		},
		{
			name: 'Kidney Function Test (KFT)',
			tests: ['Urea', 'Creatinine', 'eGFR', 'Sodium', 'Potassium', 'Bicarbonate']
		},
		{
			name: 'Widal Test',
			tests: ['Salmonella typhi O', 'Salmonella typhi H', 'Paratyphi AH', 'Paratyphi BH']
		}
	];

	const faqs = [
		{ q: 'How quickly can we start using ApexLab?', a: 'Most laboratories can begin after their workspace identity, core test catalog, users, and report standards are configured. The exact timeline depends on your operating model and whether you need custom templates or implementation support.' },
		{ q: 'What should we configure first?', a: 'Start with laboratory identity and report standards, activate the panels you run most often, establish reference ranges, invite the operational team, and complete a representative test order.' },
		{ q: 'Can ApexLab fit our existing workflow?', a: 'ApexLab is designed to be configured around your tests, specimen types, methods, reference ranges, report identity, role boundaries, and team responsibilities.' },
		{ q: 'Does the platform support multi-test reports?', a: 'Yes. Combined panels and multi-test orders can be managed in one workflow, with each parameter presented clearly for verification and final report generation.' },
		{ q: 'Can we print and download PDF reports?', a: 'Yes. Reports can be previewed, printed, and downloaded as clean A4 PDF documents. Templates can be configured to reflect your laboratory identity and presentation standards.' },
		{ q: 'Can I customize report templates?', a: 'Yes. ApexLab supports configurable report layouts and presentation styles so your final documents can align with your laboratory brand and clinical communication standards.' },
		{ q: 'How does ApexLab support accountable access?', a: 'Workspace access is organized around authenticated team members and role boundaries. Laboratories remain responsible for assigning appropriate access and reviewing their operational policies.' },
		{ q: 'Does ApexLab maintain an audit trail?', a: 'ApexLab records workflow events and relevant user actions so administrators can review activity around reports, orders, patients, settings, and approvals.' },
		{ q: 'Who is responsible for patient data policies?', a: 'Your laboratory remains responsible for the information entered into the workspace, including accuracy, lawful use, retention, permissions, and applicable privacy or healthcare requirements.' },
		{ q: 'Can I book a live demo?', a: 'Yes — use the Book demo on WhatsApp button or contact form to schedule a walkthrough tailored to your lab.' }
	];

	const reportScreenshots = [
		{
			label: 'Final report',
			title: 'A patient-ready report in seconds',
			text: 'Review verified values, reference ranges and interpretation before sharing a professional PDF.',
			kind: 'final',
		},
		{
			label: 'Report queue',
			title: 'Keep every report moving',
			text: 'Search by patient or report number, filter by status, and take action without leaving the queue.',
			kind: 'queue',
		},
		{
			label: 'Result entry',
			title: 'Enter results with confidence',
			text: 'Use your configured test templates and see normal, high or low values at a glance.',
			kind: 'entry',
		},
	];

export default function Landing({ onLoginClick, onSignupClick }: Props) {
	const [previewMode, setPreviewMode] = useState<'overview' | 'report'>('overview');
	return (
		<div className="landing-page">
			<section className="landing-hero">
				<div className="landing-hero-copy">
					<div className="landing-kicker">
						<span>
							<Sparkles size={13} /> Laboratory operations platform
						</span>
					</div>
					<h1>
						Run your lab with <em>clarity, speed and control.</em>
					</h1>
						<p className="landing-lead">
							ApexLab is the operating workspace for diagnostic laboratories: register patients, move samples, verify results, and deliver consistent reports without losing the thread.
						</p>
					<div className="landing-actions">
						<button className="landing-primary" onClick={onSignupClick}>
							Start your workspace <ArrowRight size={17} />
						</button>
						<button className="landing-secondary" onClick={onLoginClick}>
							Sign in to ApexLab
						</button>
						<a
							className="landing-whatsapp"
							href="https://wa.me/919876543210?text=Hello%20ApexLab%2C%20I%20want%20to%20book%20a%20demo."
							target="_blank"
							rel="noreferrer"
						>
							Book demo on WhatsApp
						</a>

					</div>
				</div>
					<div className="landing-product-card">
						<div className="product-window-top">
						<span className="product-brand">
							<span className="product-brand-mark">A</span> ApexLab
						</span>
							<span className="live-chip">
								<i /> Live workspace
							</span>
						</div>
						<div className="preview-switcher" role="tablist" aria-label="Product preview mode">
							<button className={previewMode === 'overview' ? 'is-active' : ''} onClick={() => setPreviewMode('overview')} role="tab" aria-selected={previewMode === 'overview'}>Operations view</button>
							<button className={previewMode === 'report' ? 'is-active' : ''} onClick={() => setPreviewMode('report')} role="tab" aria-selected={previewMode === 'report'}>Report review</button>
						</div>
						{previewMode === 'overview' ? <>
						<div className="product-greeting">
						<div>
							<span>Today at a glance</span>
							<strong>Laboratory overview</strong>
						</div>
						<span className="date-chip">Operational view</span>
					</div>
					<div className="mini-kpis">
						<div>
							<span>Patients</span>
							<strong>1,248</strong>
							<small>+12.4% this month</small>
						</div>
						<div>
							<span>Reports ready</span>
							<strong>186</strong>
							<small>24 awaiting review</small>
						</div>
					</div>
					<div className="mini-chart">
						<div className="chart-head">
							<span>Patient flow</span>
							<strong>Last 7 days</strong>
						</div>
						<div className="chart-bars">
							{[42, 58, 49, 76, 64, 88, 70].map((height, i) => (
								<span key={i} style={{ height: `${height}%` }} />
							))}
						</div>
					</div>
						<div className="mini-queue">
						<div>
							<span className="queue-icon">
								<FileCheck2 size={14} />
							</span>
							<span>
								<strong>Reports ready for review</strong>
								<small>12 reports need technician approval</small>
							</span>
						</div>
							<b>12</b>
						</div>
						</> : <div className="report-preview-panel">
							<div className="report-preview-head"><span>FINAL REPORT REVIEW</span><b>Ready for sign-off</b></div>
							<div className="report-preview-patient"><strong>Nashrin · Female · 26 years</strong><span>Order LAB-10482 · Collected today</span></div>
							<div className="report-preview-table"><div><span>Hemoglobin</span><b>12.8 g/dL</b><i>Normal</i></div><div><span>WBC count</span><b>7.4 ×10⁹/L</b><i>Normal</i></div><div><span>Platelets</span><b>248 ×10⁹/L</b><i>Normal</i></div></div>
							<div className="report-preview-footer"><span><ShieldCheck size={14} /> Verified parameters</span><button onClick={onSignupClick}>Create a report <ArrowRight size={13} /></button></div>
						</div>}
					</div>
			</section>

				<section className="landing-proof">
					<span>BUILT AROUND THE WAY LABS ACTUALLY WORK</span>
					<div>
					<strong>Patients</strong>
					<strong>Tests</strong>
					<strong>Samples</strong>
					<strong>Results</strong>
					<strong>Final reports</strong>
					<strong>Audit trail</strong>
					</div>
				</section>

					<section className="landing-trust-grid" aria-label="ApexLab product assurances">
						<div><ShieldCheck size={18} /><span><strong>Role-based access</strong><small>Give each team member a focused workspace.</small></span></div>
						<div><FileCheck2 size={18} /><span><strong>Audit-ready history</strong><small>Keep approvals and workflow events traceable.</small></span></div>
						<div><Zap size={18} /><span><strong>Fast implementation</strong><small>Start with your core panels and grow from there.</small></span></div>
						<div><Users2 size={18} /><span><strong>Built for teams</strong><small>Reception, technicians and administrators stay aligned.</small></span></div>
					</section>
					<section className="landing-decision-bar" aria-label="ApexLab next steps">
						<div><strong>Evaluating laboratory software?</strong><span>See the answers buyers ask before implementation.</span></div>
						<div><a href="/faqs">Explore FAQs <ArrowRight size={14} /></a><a className="landing-decision-demo" href="https://wa.me/919876543210?text=Hello%20ApexLab%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo on WhatsApp <ArrowRight size={14} /></a></div>
					</section>

					<section className="landing-section">
				<div className="landing-section-heading">
					<span className="landing-eyebrow">One connected workflow</span>
						<h2>Turn every sample into a clear next action.</h2>
						<p>Replace disconnected tools and manual handoffs with one traceable flow from patient registration to a signed, report-ready result.</p>
				</div>
				<div className="capability-grid">
					{capabilities.map(({ icon: Icon, title, text }) => (
						<article className="capability-card" key={title}>
							<div className="capability-icon">
								<Icon size={19} />
							</div>
							<h3>{title}</h3>
							<p>{text}</p>
							<a href="#workflow">
								Explore capability <ArrowRight size={14} />
							</a>
						</article>
					))}
				</div>
			</section>

				<section id="workflow" className="landing-workflow">
				<div className="workflow-copy">
					<span className="landing-eyebrow">Designed for every role</span>
					<h2>From front desk to final sign-off.</h2>
					<p>Every team member sees the work they need to complete, while the laboratory keeps one reliable source of truth.</p>
					<div className="workflow-list">
						<div>
							<b>01</b>
							<span>
								<strong>Reception</strong>
								<small>Register patients and create orders quickly.</small>
							</span>
						</div>
						<div>
							<b>02</b>
							<span>
								<strong>Technician</strong>
								<small>Process samples, enter and verify results.</small>
							</span>
						</div>
						<div>
							<b>03</b>
							<span>
								<strong>Administrator</strong>
								<small>Control users, plans, settings and audit activity.</small>
							</span>
						</div>
					</div>
				</div>
				<div className="workflow-visual">
					<div className="visual-label">
						<Zap size={15} /> Live workflow
					</div>
					<div className="flow-row done">
						<span>Patient registered</span>
						<b>Complete</b>
					</div>
					<div className="flow-row done">
						<span>Sample collected</span>
						<b>Complete</b>
					</div>
					<div className="flow-row current">
						<span>Results verified</span>
						<b>In review</b>
					</div>
					<div className="flow-row">
						<span>Final report</span>
						<b>Next</b>
					</div>
				</div>
				</section>

				<section className="landing-how-to" aria-labelledby="how-to-title">
					<div className="landing-section-heading how-to-heading">
						<span className="landing-eyebrow">See the workflow before you start</span>
						<h2 id="how-to-title">From a new patient to a polished report.</h2>
						<p>Use the same simple path every time. The screenshots below show what your team will see at each important moment.</p>
					</div>
					<div className="how-to-steps">
						<div className="how-to-step"><span>01</span><div><strong>Register</strong><small>Add the patient and create a test order.</small></div></div>
						<div className="how-to-step"><span>02</span><div><strong>Process</strong><small>Select a test template and enter the sample results.</small></div></div>
						<div className="how-to-step"><span>03</span><div><strong>Verify</strong><small>Review flagged values and confirm the report.</small></div></div>
						<div className="how-to-step"><span>04</span><div><strong>Deliver</strong><small>View, download or print the final patient report.</small></div></div>
					</div>
					<div className="report-gallery">
						{reportScreenshots.map((shot, index) => (
							<article className={`screenshot-card screenshot-${shot.kind}`} key={shot.kind}>
								<div className="screenshot-copy"><span className="screenshot-label">{shot.label}</span><h3>{shot.title}</h3><p>{shot.text}</p><a href="#workflow">Learn this step <ArrowRight size={14} /></a></div>
								<div className="screenshot-frame" aria-label={`${shot.label} screenshot preview`}>
									<div className="mock-browser-bar"><i /><i /><i /><span>ApexLab / {shot.label}</span></div>
									{index === 0 && <div className="mock-report"><div className="mock-report-brand"><b>A</b><span><strong>APEXLAB DIAGNOSTICS</strong><small>Trusted laboratory reporting</small></span><em>FINAL REPORT</em></div><div className="mock-patient"><span><small>Patient</small><strong>Nashrin Ahmed</strong></span><span><small>Report ID</small><strong>LAB-10482</strong></span><span><small>Collected</small><strong>12 Sep 2026</strong></span></div><div className="mock-result-head"><span>Test parameter</span><span>Result</span><span>Reference range</span><span>Status</span></div>{[['Hemoglobin','12.8 g/dL','12.0 – 16.0','Normal'],['WBC count','7.4 ×10⁹/L','4.0 – 11.0','Normal'],['Platelets','248 ×10⁹/L','150 – 450','Normal']].map(row => <div className="mock-result-row" key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><span>{row[2]}</span><i><Check size={10} />{row[3]}</i></div>)}<div className="mock-signature"><span><Check size={12} /> Verified by technician</span><b>Ready to share</b></div></div>}
									{index === 1 && <div className="mock-queue"><div className="mock-queue-title"><strong>Reports</strong><span>186 total <Download size={12} /></span></div><div className="mock-search">⌕&nbsp; Search patient or report number</div>{[['LAB-10482','Nashrin Ahmed','CBC','Completed'],['LAB-10481','Arjun Mehta','Lipid Profile','Pending'],['LAB-10480','Maya Shah','Thyroid Panel','Draft']].map(row => <div className="mock-queue-row" key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><span>{row[2]}</span><i className={row[3].toLowerCase()}>{row[3]}</i><Eye size={13} /></div>)}</div>}
									{index === 2 && <div className="mock-entry"><div className="mock-entry-head"><div><small>New report</small><strong>Nashrin Ahmed</strong></div><span>Complete Blood Count (CBC)⌄</span></div><div className="mock-entry-fields"><div><small>Hemoglobin</small><b>12.8 <em>g/dL</em></b></div><div><small>WBC count</small><b>7.4 <em>×10⁹/L</em></b></div><div><small>Platelets</small><b>248 <em>×10⁹/L</em></b></div><div><small>Report status</small><b className="entry-complete">● Completed</b></div></div><div className="mock-entry-note"><ClipboardList size={13} /><span>Interpretation is ready for clinical review.</span></div></div>}
								</div>
							</article>
						))}
					</div>
					<div className="how-to-footer"><ShieldCheck size={17} /><span><strong>Tip for a smooth setup:</strong> configure your lab identity, test templates and reference ranges first. Your team can then start with a real order immediately.</span><button className="landing-primary" onClick={onSignupClick}>Try the workflow <ArrowRight size={15} /></button></div>
				</section>

				<section className="landing-cta">
				<div>
					<span className="landing-eyebrow">Ready when you are</span>
					<h2>Give your lab a calmer operating system.</h2>
					<p>Start with a secure workspace and scale as your team grows.</p>
				</div>
				<button className="landing-primary" onClick={onSignupClick}>
					Create your workspace <ArrowRight size={17} />
				</button>
			</section>

			<section className="landing-test-groups">
				<div className="landing-section-heading">
					<span className="landing-eyebrow">Popular test groups</span>
					<h2>Common panels shown clearly</h2>
					<p>We've grouped standard panels to make ordering and report layout faster — each test is shown on its own line for readability.</p>
				</div>
				<div className="test-groups-grid">
					{testGroups.map(g => (
						<article className="test-group-card" key={g.name}>
							<strong className="group-name">{g.name}</strong>
							<ul className="group-tests">
								{g.tests.map(t => <li key={t}>{t}</li>)}
							</ul>
						</article>
					))}
				</div>
			</section>

			<section className="landing-faq-preview">
				<div className="landing-section-heading">
						<span className="landing-eyebrow">Before you choose your laboratory platform</span>
						<h2>Questions worth answering before implementation.</h2>
						<p>Review the practical questions laboratory owners and operations teams ask about onboarding, reporting, audit history, and workflow fit.</p>
				</div>
				<div className="faq-cards">
					{faqs.map(item => (
						<details className="faq-card" key={item.q}>
							<summary>{item.q}</summary>
							<p>{item.a}</p>
						</details>
					))}
				</div>
				<div className="faq-cta">
					<a href="/faqs" className="landing-secondary">View full FAQ</a>
					<a className="landing-whatsapp" href="https://wa.me/919876543210?text=Hello%20ApexLab%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo on WhatsApp</a>
				</div>
			</section>



			</div>
		);
	}
