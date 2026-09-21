import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/seo/seo-routes.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function upsertMeta(html, name, content) {
  const tag = '<meta name="' + name + '" content="' + escapeHtml(content) + '" />';
  const re = new RegExp('<meta\\s+name=["\\']' + name.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&') + '["\\'][^>]*>', 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', '    ' + tag + '\\n  </head>');
}

function upsertProperty(html, property, content) {
  const tag = '<meta property="' + property + '" content="' + escapeHtml(content) + '" />';
  const re = new RegExp('<meta\\s+property=["\\']' + property.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&') + '["\\'][^>]*>', 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', '    ' + tag + '\\n  </head>');
}

function upsertCanonical(html, href) {
  const tag = '<link rel="canonical" href="' + escapeHtml(href) + '" />';
  const re = /<link\\s+rel=["']canonical["'][^>]*>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', '    ' + tag + '\\n  </head>');
}

function upsertTitle(html, title) {
  const tag = '<title>' + escapeHtml(title) + '</title>';
  const re = /<title>[^<]*<\\/title>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', '    ' + tag + '\\n  </head>');
}

function upsertJsonLd(html, data) {
  const tag = '<script id="pathmlt-structured-data" type="application/ld+json">' + JSON.stringify(data) + '</script>';
  const re = /<script id=["']pathmlt-structured-data["'][^>]*>[\\s\\S]*?<\\/script>/i;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', '    ' + tag + '\\n  </head>');
}

function buildStructuredData(entry) {
  const canonicalUrl = seo.siteUrl + entry.canonical;
  const graph = [
    {'@type':'Organization','@id':seo.siteUrl + '/#organization',name:seo.siteName,url:seo.siteUrl,email:'support@pathmlt.com',areaServed:'IN'},
    {'@type':'WebSite','@id':seo.siteUrl + '/#website',name:seo.siteName,url:seo.siteUrl,publisher:{'@id':seo.siteUrl + '/#organization'}},
    {'@type':'SoftwareApplication','@id':seo.siteUrl + '/#software',name:seo.siteName,applicationCategory:'BusinessApplication',operatingSystem:'Web',description:'Laboratory reporting and management software for diagnostic and pathology laboratories.',url:seo.siteUrl,publisher:{'@id':seo.siteUrl + '/#organization'}},
    {'@type':'WebPage','@id':canonicalUrl + '#webpage',name:entry.title,description:entry.description,url:canonicalUrl,isPartOf:{'@id':seo.siteUrl + '/#website'},publisher:{'@id':seo.siteUrl + '/#organization'}}
  ];
  if (entry.index && entry.path !== '/') {
    graph.push({'@type':'BreadcrumbList','@id':canonicalUrl + '#breadcrumb',itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:seo.siteUrl},
      {'@type':'ListItem',position:2,name:entry.title.replace(/ \\| PathMLT$/, ''),item:canonicalUrl}
    ]});
  }
  return {'@context':'https://schema.org','@graph':graph};
}

function render(entry) {
  const canonicalUrl = seo.siteUrl + entry.canonical;
  const robots = entry.index ? 'index, follow' : 'noindex, nofollow';
  let html = template;
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
  html = upsertProperty(html, 'og:image:type', 'image/svg+xml');
  html = upsertMeta(html, 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'twitter:title', entry.title);
  html = upsertMeta(html, 'twitter:description', entry.description);
  html = upsertMeta(html, 'twitter:image', seo.ogImage);
  html = upsertMeta(html, 'twitter:image:alt', 'PathMLT laboratory reporting software');
  html = upsertCanonical(html, canonicalUrl);
  html = upsertJsonLd(html, buildStructuredData(entry));
  return html;
}

const entries = seo.routes.filter(entry => entry.canonical === entry.path);
for (const entry of entries) {
  const route = entry.path === '/' ? '' : entry.path.slice(1);
  const outputDir = path.join(root, 'dist', route);
  fs.mkdirSync(outputDir, {recursive:true});
  fs.writeFileSync(path.join(outputDir, 'index.html'), render(entry));
}
console.log('SEO prerendered ' + entries.length + ' canonical routes.');
