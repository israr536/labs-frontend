import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const seo = JSON.parse(
  fs.readFileSync(
    path.join(root, 'src/seo/seo-routes.json'),
    'utf8'
  )
);

const urls = seo.routes.filter(
  (entry) =>
    entry.index === true &&
    entry.canonical === entry.path
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((entry) => {
    const loc = seo.siteUrl + entry.path;

    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <changefreq>${entry.changefreq ?? 'monthly'}</changefreq>`,
      `    <priority>${entry.priority ?? 0.6}</priority>`,
      '  </url>'
    ].join('\n');
  }),
  '</urlset>',
  ''
].join('\n');

const sitemapPath = path.join(
  root,
  'public',
  'sitemap.xml'
);

fs.writeFileSync(
  sitemapPath,
  xml,
  'utf8'
);

console.log(
  `Generated sitemap with ${urls.length} indexable URLs.`
);