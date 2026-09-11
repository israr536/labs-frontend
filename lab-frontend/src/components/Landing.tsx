import { ArrowRight, BarChart3, FileCheck2, ShieldCheck, Sparkles, Users2, Zap } from 'lucide-react';

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
	}
];

const faqs = [
	{ q: 'Can I book a live demo?', a: 'Yes — use the Book demo on WhatsApp button or contact form to schedule a walkthrough tailored to your lab.' },
	{ q: 'Does ApexLab support audit trails?', a: 'We record workflow events, user actions and report approvals to help compliance and traceability.' },
	{ q: 'Can I customize report templates?', a: 'Yes — create and choose custom templates so final PDFs reflect your laboratory brand and clinical layout.' }
];

export default function Landing({ onLoginClick, onSignupClick }: Props) {
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
					<span className="landing-eyebrow">FAQ</span>
					<h2>Questions customers commonly ask</h2>
					<p>Short answers to get you started — visit the full FAQ for more details or to book a demo.</p>
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
				.faq-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}
				.faq-card{padding:14px;border-radius:12px;border:1px solid var(--border);background:var(--panel-bg);cursor:pointer}
				.faq-card summary{cursor:pointer;font-weight:800;list-style:none;outline:none}
				.faq-card p{margin-top:10px;color:var(--text);line-height:1.7}
				.faq-cta{display:flex;gap:12px;margin-top:18px}
				/* Responsive tweaks */
				@media(max-width:1100px){.landing-hero{grid-template-columns:1fr 380px}.test-groups-grid{grid-template-columns:repeat(2,1fr)}.faq-cards{grid-template-columns:repeat(2,1fr)}}
					@media(max-width:760px){.landing-hero{grid-template-columns:1fr;gap:22px}.test-groups-grid{grid-template-columns:1fr}.faq-cards{grid-template-columns:1fr}.landing-product-card{order:2}.landing-trust-grid{grid-template-columns:1fr 1fr}.landing-trust-grid>div{padding:14px 12px}}
					@media(max-width:460px){.landing-trust-grid{grid-template-columns:1fr}}
			`}</style>

			</div>
		);
	}
