import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.pathmlt.com';
const SITE_NAME = 'PathMLT';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const DEFAULT_DESCRIPTION =
  'PathMLT is diagnostic laboratory management software for pathology labs to manage patients, test catalogs, samples, results, verification and professional PDF lab reports from one connected workspace.';
const KEYWORDS = 'diagnostic lab software, pathology lab management software, laboratory reporting software, pathology report software, lab automation, patient and test management';

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
    const config = pages[pathname] ?? { title: `${SITE_NAME} | Laboratory Reporting Software`, description: DEFAULT_DESCRIPTION, canonical: '/', index: false };
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
      mainEntity: [
        ['How quickly can we start using PathMLT?', 'Most laboratories can begin with their core patient, test and reporting workflows after an onboarding review.'],
        ['Can I customize report templates?', 'Yes. Administrators can configure report templates, laboratory identity, reference ranges and result parameters for their workflow.'],
        ['Does PathMLT maintain an audit trail?', 'PathMLT records important workflow events and approvals so laboratory teams can review operational history.'],
      ].map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
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
