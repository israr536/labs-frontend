import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/seo/seo-routes.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');

const serverEntry = path.join(root, 'dist-server', 'entry-server.js');
if (!fs.existsSync(serverEntry)) {
  throw new Error('SSR bundle not found. Run the Vite SSR build before prerendering.');
}

const { render } = await import(pathToFileURL(serverEntry).href);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function upsertMeta(html, name, content) {
  const tag = `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
  const re = new RegExp(`<meta\\s+name=["']${escapeRegExp(name)}["'][^>]*>`, 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertProperty(html, property, content) {
  const tag = `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`;
  const re = new RegExp(`<meta\\s+property=["']${escapeRegExp(property)}["'][^>]*>`, 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const re = /<link\s+rel=["']canonical["'][^>]*>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertTitle(html, title) {
  const tag = `<title>${escapeHtml(title)}</title>`;
  const re = /<title>[^<]*<\/title>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function buildStructuredData(entry) {
  const canonicalUrl = seo.siteUrl + entry.canonical;
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${seo.siteUrl}/#organization`,
      name: seo.siteName,
      url: seo.siteUrl,
      email: 'support@pathmlt.com',
      areaServed: 'IN',
    },
    {
      '@type': 'WebSite',
      '@id': `${seo.siteUrl}/#website`,
      name: seo.siteName,
      url: seo.siteUrl,
      publisher: { '@id': `${seo.siteUrl}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${seo.siteUrl}/#software`,
      name: seo.siteName,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Laboratory reporting and management software for diagnostic and pathology laboratories.',
      url: seo.siteUrl,
      publisher: { '@id': `${seo.siteUrl}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: entry.title,
      description: entry.description,
      url: canonicalUrl,
      isPartOf: { '@id': `${seo.siteUrl}/#website` },
      publisher: { '@id': `${seo.siteUrl}/#organization` },
    },
  ];

  if (entry.index && entry.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: seo.siteUrl },
        { '@type': 'ListItem', position: 2, name: entry.title.replace(/\s*\|\s*PathMLT$/, ''), item: canonicalUrl },
      ],
    });
  }

  if (entry.path === '/faqs') {
    const faqSchema = JSON.parse(fs.readFileSync(path.join(root, 'src/seo/faq-schema.json'), 'utf8'));
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: faqSchema.questions.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function renderDocument(templateHtml, entry, body) {
  const canonicalUrl = seo.siteUrl + entry.canonical;
  const robots = entry.index ? 'index, follow' : 'noindex, nofollow';
  let html = templateHtml;

  html = upsertTitle(html, entry.title);
  html = upsertMeta(html, 'description', entry.description);
  html = upsertMeta(html, 'robots', robots);
  html = upsertMeta(html, 'googlebot', robots);
  html = upsertMeta(html, 'author', seo.siteName);
  html = upsertProperty(html, 'og:type', 'website');
  html = upsertProperty(html, 'og:site_name', seo.siteName);
  html = upsertProperty(html, 'og:title', entry.title);
  html = upsertProperty(html, 'og:description', entry.description);
  html = upsertProperty(html, 'og:url', canonicalUrl);
  html = upsertProperty(html, 'og:locale', seo.defaultLocale);
  html = upsertProperty(html, 'og:image', seo.ogImage);
  html = upsertProperty(html, 'og:image:alt', 'PathMLT laboratory reporting software');
  html = upsertProperty(html, 'og:image:type', 'image/png');
  html = upsertProperty(html, 'og:image:width', '1200');
  html = upsertProperty(html, 'og:image:height', '630');
  html = upsertMeta(html, 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'twitter:title', entry.title);
  html = upsertMeta(html, 'twitter:description', entry.description);
  html = upsertMeta(html, 'twitter:image', seo.ogImage);
  html = upsertMeta(html, 'twitter:image:alt', 'PathMLT laboratory reporting software');
  html = upsertCanonical(html, canonicalUrl);
  html = html.replace(
    /<script id=["']pathmlt-structured-data["'][^>]*>[\s\S]*?<\/script>/i,
    `<script id="pathmlt-structured-data" type="application/ld+json">${JSON.stringify(buildStructuredData(entry))}</script>`,
  );
  html = html.replace(
    /<div id=["']root["'][^>]*><\/div>/i,
    `<div id="root" data-prerendered="true">${body}</div>`,
  );

  if (!html.includes('data-prerendered="true"')) {
    throw new Error(`Could not inject prerendered content for ${entry.path}`);
  }

  return html;
}


const entries = seo.routes.filter(
  (entry) =>
    entry.index === true &&
    entry.canonical === entry.path &&
    entry.path !== '/dashboard' &&
    entry.path !== '/report-templates'
);

for (const entry of entries) {
  const pathname = entry.path === '/' ? '/' : entry.path;
  const body = await render(pathname);

  const h1Count = (body.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) {
    throw new Error(`${entry.path} rendered ${h1Count} H1 elements; expected exactly one.`);
  }

  const textLength = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .length;

  if (entry.index && textLength < 700) {
    throw new Error(`${entry.path} produced only ${textLength} characters of prerendered text.`);
  }

  const outputDir = entry.path === '/' ? path.join(root, 'dist') : path.join(root, 'dist', entry.path.slice(1));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), renderDocument(template, entry, body), 'utf8');
}

fs.rmSync(path.join(root, 'dist-server'), { recursive: true, force: true });

console.log(`SEO prerendered ${entries.length} canonical routes with route-specific React HTML.`);
