import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.pathmlt.com';
const SITE_NAME = 'PathMLT';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const DEFAULT_DESCRIPTION =
  'PathMLT is laboratory reporting software for diagnostic labs to manage patients, tests, results and professional lab reports from one connected workspace.';

type SeoConfig = {
  title: string;
  description: string;
  canonical: string;
  index: boolean;
};

const pages: Record<string, SeoConfig> = {
  '/': { title: 'Laboratory Reporting Software for Diagnostic Labs | PathMLT', description: DEFAULT_DESCRIPTION, canonical: '/', index: true },
  '/solutions': { title: 'Laboratory Software Solutions for Diagnostic Labs | PathMLT', description: 'Explore PathMLT solutions for patient management, test management, result entry, reporting, team workflows and laboratory operations.', canonical: '/solutions', index: true },
  '/pricing': { title: 'Laboratory Reporting Software Pricing | PathMLT', description: 'See PathMLT laboratory reporting software plans for diagnostic labs and compare features, usage and workspace options.', canonical: '/pricing', index: true },
  '/faqs': { title: 'Laboratory Software FAQs | PathMLT', description: 'Answers about PathMLT laboratory reporting software, implementation, report templates, PDF reports, access controls and workflows.', canonical: '/faqs', index: true },
  '/faq': { title: 'Laboratory Software FAQs | PathMLT', description: 'Answers about PathMLT laboratory reporting software, implementation, report templates, PDF reports, access controls and workflows.', canonical: '/faqs', index: false },
  '/about': { title: 'About PathMLT | Laboratory Reporting Software', description: 'Learn about PathMLT and its approach to practical laboratory reporting and diagnostic lab operations software.', canonical: '/about', index: true },
  '/contact': { title: 'Contact PathMLT | Laboratory Software Demo', description: 'Contact PathMLT to discuss laboratory reporting software, implementation, workflows and a product demonstration for your diagnostic lab.', canonical: '/contact', index: true },
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

    upsertJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL },
        { '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: SITE_NAME, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: DEFAULT_DESCRIPTION, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#organization` } },
        ...(pathname === '/' ? [{ '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#organization` } }] : []),
      ],
    });
  }, [pathname]);

  return null;
}
