import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/seo/seo-routes.json'), 'utf8'));

const urls = seo.routes.filter(
  (entry) => entry.index === true && entry.canonical === entry.path
);

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((entry) => [
    '  <url>',
    `    <loc>${escapeXml(seo.siteUrl + entry.path)}</loc>`,
    `    <changefreq>${escapeXml(entry.changefreq ?? 'monthly')}</changefreq>`,
    `    <priority>${escapeXml(entry.priority ?? 0.6)}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n');

const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');

console.log(`Generated sitemap with ${urls.length} canonical indexable URLs.`);
