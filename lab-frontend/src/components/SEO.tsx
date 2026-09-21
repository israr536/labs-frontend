import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { faqItems } from '../data/faqData';
import seoData from '../seo/seo-routes.json';

const { siteUrl: SITE_URL, siteName: SITE_NAME, ogImage: OG_IMAGE } = seoData;
type SeoConfig = (typeof seoData.routes)[number];

const routeMap = new Map(seoData.routes.map(route => [route.path, route] as const));

function configForPath(pathname: string): SeoConfig {
  return routeMap.get(pathname) ?? {
    path: pathname,
    title: `${SITE_NAME} | Laboratory Reporting Software`,
    description: 'PathMLT connects diagnostic laboratory workflows for patients, tests, results, verification and reporting.',
    canonical: '/',
    index: false,
  };
}

function upsertMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

function upsertJsonLd(data: object) {
  const id = 'pathmlt-structured-data';
  let element = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

function buildStructuredData(config: SeoConfig) {
  const canonicalUrl = `${SITE_URL}${config.canonical}`;
  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      email: 'support@pathmlt.com',
      areaServed: 'IN',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Laboratory reporting and management software for diagnostic and pathology laboratories.',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: config.title,
      description: config.description,
      url: canonicalUrl,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ];

  if (config.index && config.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: config.title.replace(/ \\| PathMLT$/, ''),
          item: canonicalUrl,
        },
      ],
    });
  }

  if (config.path === '/' || config.path === '/faqs') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqItems.slice(0, 6).map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const config = configForPath(pathname);
    const canonicalUrl = `${SITE_URL}${config.canonical}`;
    const robots = config.index ? 'index, follow' : 'noindex, nofollow';

    document.title = config.title;
    upsertMeta('description', config.description);
    upsertMeta('robots', robots);
    upsertMeta('googlebot', robots);
    upsertMeta('author', SITE_NAME);
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
    upsertJsonLd(buildStructuredData(config));
  }, [pathname]);

  return null;
}
