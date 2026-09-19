import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src/components/SEO.tsx'), 'utf8');
const templatePath = path.join(root, 'dist/index.html');
const template = fs.readFileSync(templatePath, 'utf8');

const SITE_URL = 'https://www.pathmlt.com';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;

const entries = [];

function collectEntries(blockName, defaults = {}) {
  const blockStart = source.indexOf(`const ${blockName}`);
  if (blockStart < 0) return;

  const blockEnd = source.indexOf('\n};', blockStart);
  if (blockEnd < 0) return;

  const block = source.slice(blockStart, blockEnd);
  const entryPattern = /['"](\/[^'"]*)['"]:\{title:'([^']+)',description:'([^']+)'(?:,canonical:'([^']+)',index:(true|false))?\}/g;

  for (const match of block.matchAll(entryPattern)) {
    const [, pathname, title, description, canonical, index] = match;
    entries.push({
      pathname,
      title,
      description,
      canonical: canonical ?? defaults.canonical ?? pathname,
      index: index === undefined ? (defaults.index ?? true) : index === 'true'
    });
  }
}

collectEntries('pages');
collectEntries('seoPages', { index: true });

if (!entries.length) {
  throw new Error('No SEO routes were found in src/components/SEO.tsx');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function upsertMeta(html, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  const re = /<meta\s+name=["']([^"']+)["'][^>]*>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertProperty(html, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  const re = /<meta\s+property=["']([^"']+)["'][^>]*>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const re = /<link\s+rel=["']canonical["'][^>]*>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function upsertJsonLd(html, data) {
  const tag = `<script id="pathmlt-structured-data" type="application/ld+json">${JSON.stringify(data)}</script>`;
  const re = /<script id=["']pathmlt-structured-data["'][^>]*>[\s\S]*?<\/script>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function render(entry) {
  const canonicalUrl = `${SITE_URL}${entry.canonical}`;
  let html = template;
  html = upsertTitle(html, entry.title);
  html = upsertMeta(html, 'description', entry.description);
  html = upsertMeta(html, 'robots', entry.index ? 'index, follow' : 'noindex, nofollow');
  html = upsertMeta(html, 'googlebot', entry.index ? 'index, follow' : 'noindex, nofollow');
  html = upsertProperty(html, 'og:type', 'website');
  html = upsertProperty(html, 'og:site_name', 'PathMLT');
  html = upsertProperty(html, 'og:title', entry.title);
  html = upsertProperty(html, 'og:description', entry.description);
  html = upsertProperty(html, 'og:url', canonicalUrl);
  html = upsertProperty(html, 'og:locale', 'en_IN');
  html = upsertProperty(html, 'og:image', OG_IMAGE);
  html = upsertMeta(html, 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'twitter:title', entry.title);
  html = upsertMeta(html, 'twitter:description', entry.description);
  html = upsertMeta(html, 'twitter:image', OG_IMAGE);
  html = upsertCanonical(html, canonicalUrl);

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'PathMLT',
      url: SITE_URL,
      email: 'support@pathmlt.com',
      areaServed: 'IN'
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'PathMLT',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'PathMLT',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Laboratory reporting and management software for diagnostic and pathology laboratories.',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` }
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: entry.title,
      description: entry.description,
      url: canonicalUrl,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` }
    }
  ];

  if (entry.index && entry.pathname !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: entry.title.replace(/ \| PathMLT$/, ''), item: canonicalUrl }
      ]
    });
  }

  html = upsertJsonLd(html, { '@context': 'https://schema.org', '@graph': graph });
  return html;
}

for (const entry of entries) {
  const route = entry.pathname === '/' ? '' : entry.pathname.replace(/^\//, '');
  const outputDir = path.join(root, 'dist', route);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), render(entry));
}

console.log(`SEO prerendered ${entries.length} routes.`);
