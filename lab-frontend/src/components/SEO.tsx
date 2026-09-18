import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { faqItems } from '../data/faqData';

const SITE_URL = 'https://www.pathmlt.com';
const SITE_NAME = 'PathMLT';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const SEO_PATHS = new Set(['laboratory-reporting-software','diagnostic-lab-software','pathology-lab-software','laboratory-management-software','lab-reporting-system','pathology-reporting-software','lims-software','lab-automation-software','patient-management','test-management','sample-management','result-entry','result-verification','lab-reporting','report-templates','reference-ranges','audit-trail','role-based-access','pdf-reports','pathology-labs','diagnostic-labs','hospital-labs','independent-labs']);
const DEFAULT_DESCRIPTION =
  'PathMLT is diagnostic laboratory management software for pathology labs to manage patients, test catalogs, samples, results, verification and professional PDF lab reports from one connected workspace.';
const KEYWORDS = 'diagnostic lab software, pathology lab management software, laboratory reporting software, pathology report software, lab automation, patient and test management';
const SEO_DESCRIPTIONS: Record<string,string> = {"/laboratory-reporting-software":"Laboratory reporting software for diagnostic labs. Manage patients, tests, samples, results, verification and professional PDF reports in one workflow.","/diagnostic-lab-software":"Diagnostic lab software connecting patient registration, tests, result entry, verification and final reporting.","/pathology-lab-software":"Pathology lab software for configurable tests, reference ranges, verification, audit history and consistent reports.","/laboratory-management-software":"Laboratory management software for patients, tests, samples, results, reports, users and operational controls.","/lab-reporting-system":"Lab reporting system for structured result entry, reference ranges, verification and final PDF generation.","/pathology-reporting-software":"Pathology reporting software for consistent reports, configurable parameters, reference ranges and review steps.","/lims-software":"Laboratory information workflow software connecting patient, testing, result and reporting operations.","/lab-automation-software":"Lab automation software for repeatable result validation, verification and report generation workflows.","/patient-management":"Patient management software for diagnostic laboratories with searchable records and connected orders and reports.","/test-management":"Test management software with configurable parameters, sample types, departments and reference ranges.","/sample-management":"Sample management for traceable laboratory workflows connected to patient orders and results.","/result-entry":"Structured laboratory result entry with parameter-specific validation and configured reference information.","/result-verification":"Laboratory result verification with flagged values, required-result checks and controlled finalization.","/lab-reporting":"Laboratory reporting from verified results to consistent, professional final reports and PDFs.","/report-templates":"Configurable laboratory report templates for reusable layouts, identity and consistent PDF presentation.","/reference-ranges":"Reference range management with parameter-level data and historical reporting support.","/audit-trail":"Audit trail for laboratory workflow history, approvals and important user actions.","/role-based-access":"Role-based access for laboratory teams with authenticated and controlled responsibilities.","/pdf-reports":"Professional PDF lab reports generated from finalized laboratory results.","/pathology-labs":"Laboratory software for pathology labs focused on testing, result review and controlled report delivery.","/diagnostic-labs":"Laboratory software for diagnostic labs covering patients, orders, results and report delivery.","/hospital-labs":"Laboratory workflow software for hospital labs with role-aware access and traceable reporting.","/independent-labs":"Software for independent diagnostic laboratories covering patient workflows, testing, reporting and controls."};

type SeoConfig = {
  title: string;
  description: string;
  canonical: string;
  index: boolean;
};

const pages: Record<string, SeoConfig> = {
  '/': { title: 'Laboratory Reporting Software for Diagnostic Labs | PathMLT', description: DEFAULT_DESCRIPTION, canonical: '/', index: true },
  '/solutions': { title: 'Diagnostic Lab & Pathology Software Solutions | PathMLT', description: 'Explore patient management, test catalog, sample tracking, result entry, verification, audit trail and pathology report software for diagnostic laboratories.', canonical: '/solutions', index: true },
  '/pricing': { title: 'Diagnostic Laboratory Management Software Pricing | PathMLT', description: 'Compare PathMLT plans for pathology and diagnostic labs. Start with a practical laboratory reporting workspace and scale as your team grows.', canonical: '/pricing', index: true },
  '/faqs': { title: 'Pathology Lab Software FAQs | PathMLT', description: 'Answers about diagnostic laboratory management software, pathology report templates, PDF reports, access controls, implementation and workflows.', canonical: '/faqs', index: true },
  '/faq': { title: 'Laboratory Software FAQs | PathMLT', description: 'Answers about PathMLT laboratory reporting software, implementation, report templates, PDF reports, access controls and workflows.', canonical: '/faqs', index: false },
  '/about': { title: 'About PathMLT | Diagnostic Laboratory Software', description: 'Learn how PathMLT helps pathology and diagnostic laboratories connect patient registration, tests, samples, results and final reports.', canonical: '/about', index: true },
  '/contact': { title: 'Contact PathMLT | Pathology Lab Software Demo', description: 'Talk to PathMLT about diagnostic laboratory management software, pathology reporting workflows, implementation and a tailored product demonstration.', canonical: '/contact', index: true },
  '/help': { title: 'PathMLT Help Center | Laboratory Software', description: 'Find practical guidance for using PathMLT laboratory reporting software and managing your laboratory workspace.', canonical: '/help', index: true },
  '/privacy': { title: 'Privacy Policy | PathMLT', description: 'Read the PathMLT privacy policy and information about data handling and responsibilities.', canonical: '/privacy', index: false },
  '/terms': { title: 'Terms and Conditions | PathMLT', description: 'Read the PathMLT terms and conditions for use of the laboratory software platform.', canonical: '/terms', index: false },
  '/login': { title: 'Sign In | PathMLT', description: 'Securely sign in to your PathMLT laboratory workspace.', canonical: '/login', index: false },
  '/signup': { title: 'Create Your Laboratory Workspace | PathMLT', description: 'Create a PathMLT workspace for your diagnostic laboratory.', canonical: '/signup', index: false },
  '/forgot-password': { title: 'Reset Password | PathMLT', description: 'Recover access to your PathMLT laboratory workspace.', canonical: '/forgot-password', index: false },
  '/dashboard': { title: 'Laboratory Dashboard | PathMLT', description: 'Manage your PathMLT laboratory workspace.', canonical: '/dashboard', index: false },
  '/report-templates': { title: 'Report Templates | PathMLT', description: 'Manage laboratory report templates in your PathMLT workspace.', canonical: '/report-templates', index: false },
};

function seoConfigForPath(pathname: string): SeoConfig | undefined {
  const slug = pathname.replace(/^\//, '');
  if (!SEO_PATHS.has(slug)) return undefined;
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return { title: `${title} | PathMLT`, description: DEFAULT_DESCRIPTION, canonical: pathname, index: true };
}

function upsertMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) { element = document.createElement('meta'); element.name = name; document.head.appendChild(element); }
  element.content = content;
}

function upsertProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute('property', property); document.head.appendChild(element); }
  element.content = content;
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = href;
}

function upsertJsonLd(data: object) {
  const id = 'pathmlt-structured-data';
  let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) { script = document.createElement('script'); script.id = id; script.type = 'application/ld+json'; document.head.appendChild(script); }
  script.textContent = JSON.stringify(data);
}

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const config = pages[pathname] ?? seoConfigForPath(pathname) ?? { title: `${SITE_NAME} | Laboratory Reporting Software`, description: DEFAULT_DESCRIPTION, canonical: '/', index: false };
    if (!pages[pathname] && SEO_DESCRIPTIONS[pathname]) config.description = SEO_DESCRIPTIONS[pathname];
    const canonicalUrl = `${SITE_URL}${config.canonical}`;

    document.title = config.title;
    upsertMeta('description', config.description);
    upsertMeta('keywords', KEYWORDS);
    upsertMeta('robots', config.index ? 'index, follow' : 'noindex, nofollow');
    upsertMeta('googlebot', config.index ? 'index, follow' : 'noindex, nofollow');
    upsertMeta('theme-color', '#ffffff');

    upsertProperty('og:type', 'website');
    upsertProperty('og:site_name', SITE_NAME);
    upsertProperty('og:title', config.title);
    upsertProperty('og:description', config.description);
    upsertProperty('og:url', canonicalUrl);
    upsertProperty('og:locale', 'en_IN');
    upsertProperty('og:image', OG_IMAGE);
    upsertProperty('og:image:alt', 'PathMLT laboratory reporting software');
    upsertProperty('og:image:type', 'image/svg+xml');

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', config.title);
    upsertMeta('twitter:description', config.description);
    upsertMeta('twitter:image', OG_IMAGE);
    upsertMeta('twitter:image:alt', 'PathMLT laboratory reporting software');

    upsertCanonical(canonicalUrl);

    const faqSchema = pathname === '/faqs' ? {
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    } : null;

    upsertJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: 'support@pathmlt.com', areaServed: 'IN' },
        { '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: SITE_NAME, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: DEFAULT_DESCRIPTION, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#organization` } },
        { '@type': 'WebPage', '@id': `${canonicalUrl}#webpage`, name: config.title, description: config.description, url: canonicalUrl, isPartOf: { '@id': `${SITE_URL}/#website` }, publisher: { '@id': `${SITE_URL}/#organization` } },
        ...(pathname === '/' ? [{ '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#organization` } }] : []),
        ...(faqSchema ? [faqSchema] : []),
      ],
    });
  }, [pathname]);

  return null;
}
