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

			<style>{`
			/* Landing page scoped improvements */
				.landing-page{max-width:1180px;margin:28px auto;padding:28px 20px 80px}
				.landing-hero{display:grid;grid-template-columns:1fr 420px;gap:42px;align-items:start;padding:28px 0 38px}
				.landing-hero-copy h1{font-size:clamp(2.2rem,5vw,3.6rem);line-height:1;letter-spacing:-0.02em;margin:14px 0}
				.landing-lead{font-size:1.03rem;color:var(--text);max-width:640px}
				.landing-actions{display:flex;gap:12px;align-items:center;margin-top:20px}
				.landing-primary{background:var(--primary);color:#fff;padding:12px 18px;border-radius:12px;border:1px solid rgba(0,0,0,0.02);font-weight:800;box-shadow:0 12px 30px rgba(6,96,137,0.12)}
				.landing-secondary{background:transparent;border:1px solid var(--border);padding:10px 16px;border-radius:12px;color:var(--text-bold);font-weight:700}
					.landing-whatsapp{background:#25d366;border-color:#25d366;color:#fff;padding:11px 16px;border-radius:12px;font-weight:800;text-decoration:none}
					.landing-trust{display:flex;gap:12px;align-items:center;margin-top:20px;color:var(--text);font-weight:700}
					.landing-trust-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin:0 0 32px;border:1px solid var(--border);border-radius:15px;background:var(--border);overflow:hidden}
					.landing-trust-grid>div{display:flex;align-items:flex-start;gap:10px;padding:17px 16px;background:var(--panel-bg)}
					.landing-trust-grid svg{flex:0 0 auto;color:var(--primary);margin-top:2px}
					.landing-trust-grid span{display:grid;gap:4px}.landing-trust-grid strong{font-size:.72rem;color:var(--text-bold)}.landing-trust-grid small{font-size:.62rem;line-height:1.5;color:var(--text)}
				/* Product card */
				.landing-product-card{padding:18px;border-radius:16px;background:linear-gradient(180deg, var(--panel-bg), color-mix(in srgb, var(--panel-bg) 88%, transparent));border:1px solid var(--border);box-shadow:0 18px 40px rgba(15,23,42,0.06)}
				.product-window-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
				.product-brand{font-weight:800;color:var(--text-bold);display:flex;align-items:center;gap:8px}
				.product-brand-mark{width:34px;height:34px;border-radius:10px;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:900}
				.mini-kpis{display:flex;gap:14px;margin:12px 0}
				.mini-kpis>div{flex:1;padding:10px;border-radius:10px;background:rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.03)}
				.mini-chart .chart-bars{display:flex;align-items:end;gap:6px;height:72px}
				.mini-chart .chart-bars span{width:8px;background:linear-gradient(180deg,var(--primary),color-mix(in srgb,var(--primary) 70%, #fff));border-radius:6px}
				.mini-queue{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
				/* Test groups */
				.test-groups-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:12px}
				.test-group-card{padding:16px;border-radius:12px;background:var(--panel-bg);border:1px solid var(--border);transition:transform .18s ease,box-shadow .18s ease}
				.test-group-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(15,23,42,0.06)}
				.group-name{display:block;margin-bottom:10px;color:var(--text-bold);font-weight:800}
				.group-tests{list-style:none;padding:0;margin:0;display:block}
				.group-tests li{padding:6px 0;border-bottom:1px dashed rgba(15,23,42,0.04);font-size:0.98rem;color:var(--text)}
					/* FAQ preview */
					/* Guided workflow + screenshot gallery */
					.landing-how-to{padding:76px 0 22px}.how-to-heading{max-width:720px}.how-to-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:28px 0 26px}.how-to-step{display:flex;gap:11px;padding:15px;border:1px solid var(--border);border-radius:13px;background:var(--panel-bg)}.how-to-step>span{color:var(--primary);font-size:.72rem;font-weight:900;letter-spacing:.08em}.how-to-step div{display:grid;gap:4px}.how-to-step strong{font-size:.88rem;color:var(--text-bold)}.how-to-step small{font-size:.73rem;line-height:1.45;color:var(--text)}
					.report-gallery{display:grid;grid-template-columns:1fr;gap:22px}.screenshot-card{display:grid;grid-template-columns:240px 1fr;gap:28px;align-items:center;padding:22px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(135deg,var(--panel-bg),rgba(255,255,255,.48));overflow:hidden}.screenshot-card:nth-child(even){grid-template-columns:1fr 240px}.screenshot-card:nth-child(even) .screenshot-copy{order:2}.screenshot-copy{padding:0 4px}.screenshot-label{display:inline-block;color:var(--primary);font-size:.68rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.screenshot-copy h3{font-size:1.25rem;line-height:1.15;margin:9px 0}.screenshot-copy p{font-size:.83rem;line-height:1.6;color:var(--text);margin-bottom:13px}.screenshot-copy a{display:inline-flex;gap:6px;align-items:center;color:var(--primary);font-size:.78rem;font-weight:800;text-decoration:none}.screenshot-frame{border:1px solid #dbe5ea;border-radius:12px;background:#f7fafb;box-shadow:0 16px 30px rgba(15,23,42,.1);padding:0;min-height:202px;overflow:hidden}.mock-browser-bar{height:25px;display:flex;align-items:center;gap:4px;padding:0 10px;background:#edf3f5;border-bottom:1px solid #dbe5ea}.mock-browser-bar i{width:5px;height:5px;border-radius:50%;background:#9eb1b9}.mock-browser-bar span{margin-left:8px;font-size:7px;color:#84969f}.mock-report,.mock-queue,.mock-entry{padding:15px;color:#31434d;font-family:var(--font-sans)}.mock-report-brand{display:flex;align-items:center;gap:7px;border-bottom:1px solid #d9e4e8;padding-bottom:10px}.mock-report-brand>b{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:#08648e;color:#fff;font-size:11px}.mock-report-brand span{display:grid}.mock-report-brand strong{font-size:7px;letter-spacing:.07em}.mock-report-brand small{font-size:6px;color:#8a9da6}.mock-report-brand em{margin-left:auto;font-style:normal;font-size:6px;color:#0c8d78;font-weight:800}.mock-patient{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:10px;padding:11px 0}.mock-patient span,.mock-result-head,.mock-result-row{display:grid;gap:3px}.mock-patient small,.mock-result-head,.mock-result-row span{font-size:6px;color:#8b9da5}.mock-patient strong,.mock-result-row b{font-size:7px}.mock-result-head,.mock-result-row{grid-template-columns:1.3fr 1fr 1.1fr .7fr;align-items:center;padding:7px 6px;border-top:1px solid #e4ecef}.mock-result-row i{display:flex;align-items:center;gap:2px;color:#0b9277;font-size:6px;font-style:normal;font-weight:800}.mock-signature{display:flex;justify-content:space-between;margin-top:13px;padding-top:9px;border-top:1px solid #d9e4e8;font-size:6px;color:#0b9277}.mock-signature b{color:#08648e}.mock-queue-title,.mock-entry-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:13px}.mock-queue-title strong,.mock-entry-head strong{display:block;font-size:13px}.mock-queue-title span{display:flex;align-items:center;gap:5px;font-size:7px;color:#7d9099}.mock-search{padding:7px 9px;border:1px solid #d9e4e8;border-radius:6px;color:#9aabb2;font-size:7px;margin-bottom:7px}.mock-queue-row{display:grid;grid-template-columns:.8fr 1.4fr 1.2fr .8fr 16px;gap:7px;align-items:center;padding:8px 4px;border-bottom:1px solid #e4ecef;font-size:7px}.mock-queue-row>b{font-size:6px;color:#08648e}.mock-queue-row i{font-style:normal;font-size:6px;font-weight:800;padding:3px 5px;border-radius:9px;text-align:center}.mock-queue-row .completed{color:#0a8c74;background:#dff6ee}.mock-queue-row .pending{color:#aa7010;background:#fff1d2}.mock-queue-row .draft{color:#6464bc;background:#e9e8ff}.mock-entry-head{padding-bottom:11px;border-bottom:1px solid #d9e4e8}.mock-entry-head small{display:block;color:#8a9da6;font-size:6px;margin-bottom:3px}.mock-entry-head strong{font-size:12px}.mock-entry-head>span{padding:7px 9px;border:1px solid #d7e3e7;border-radius:6px;font-size:7px;color:#536871}.mock-entry-fields{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:14px 0}.mock-entry-fields>div{padding:9px;border-radius:7px;background:#fff;border:1px solid #e4ecef}.mock-entry-fields small{display:block;font-size:6px;color:#8a9da6;margin-bottom:5px}.mock-entry-fields b{font-size:9px}.mock-entry-fields em{font-size:6px;color:#8a9da6;font-style:normal;font-weight:400}.mock-entry-fields .entry-complete{font-size:7px;color:#0b9277}.mock-entry-note{display:flex;gap:6px;align-items:center;padding:9px;background:#e8f7f3;border-radius:7px;color:#0b806c;font-size:7px}.how-to-footer{display:flex;align-items:center;gap:10px;margin-top:22px;padding:14px 16px;border:1px solid rgba(6,96,137,.14);border-radius:13px;background:var(--primary-light);color:var(--text);font-size:.78rem}.how-to-footer svg{flex:0 0 auto;color:var(--primary)}.how-to-footer span{flex:1}.how-to-footer strong{color:var(--text-bold)}.how-to-footer button{display:flex;align-items:center;gap:7px;white-space:nowrap}
					.faq-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}
				.faq-card{padding:14px;border-radius:12px;border:1px solid var(--border);background:var(--panel-bg);cursor:pointer}
				.faq-card summary{cursor:pointer;font-weight:800;list-style:none;outline:none}
				.faq-card p{margin-top:10px;color:var(--text);line-height:1.7}
				.faq-cta{display:flex;gap:12px;margin-top:18px}
				/* Responsive tweaks */
					@media(max-width:1100px){.landing-hero{grid-template-columns:1fr 380px}.test-groups-grid{grid-template-columns:repeat(2,1fr)}.faq-cards{grid-template-columns:repeat(2,1fr)}.how-to-steps{grid-template-columns:repeat(2,1fr)}}
						@media(max-width:760px){.landing-hero{grid-template-columns:1fr;gap:22px}.test-groups-grid{grid-template-columns:1fr}.faq-cards{grid-template-columns:1fr}.landing-product-card{order:2}.landing-trust-grid{grid-template-columns:1fr 1fr}.landing-trust-grid>div{padding:14px 12px}.how-to-steps{grid-template-columns:1fr}.screenshot-card,.screenshot-card:nth-child(even){grid-template-columns:1fr;gap:16px}.screenshot-card:nth-child(even) .screenshot-copy{order:0}.screenshot-copy{padding:0}.how-to-footer{align-items:flex-start;flex-wrap:wrap}.how-to-footer button{margin-left:27px}}
					@media(max-width:460px){.landing-trust-grid{grid-template-columns:1fr}}
			`}</style>

			</div>
		);
	}
