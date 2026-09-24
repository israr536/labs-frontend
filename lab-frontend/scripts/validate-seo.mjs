import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/seo/seo-routes.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');

const fail = (message) => {
  throw new Error(`SEO validation failed: ${message}`);
};

const htmlText = (value) => value
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();

const canonicalIndexable = seo.routes.filter((entry) => entry.index === true && entry.canonical === entry.path);
const canonicalTargets = new Map();

for (const entry of seo.routes) {
  if (entry.canonical !== entry.path && entry.index === true) {
    fail(`route ${entry.path} is marked indexable but points at another canonical`);
  }
  if (entry.index === true) {
    const existing = canonicalTargets.get(entry.canonical);
    if (existing) fail(`duplicate canonical ${entry.canonical} for ${existing} and ${entry.path}`);
    canonicalTargets.set(entry.canonical, entry.path);
  }
}

if (!fs.existsSync(dist)) fail('dist directory does not exist');
const rootHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!rootHtml.includes('<meta name="description"')) fail('dist/index.html is missing a description');
if (!rootHtml.includes('data-prerendered="true"')) fail('homepage was not prerendered');

const seenBodies = new Map();
const prerenderExcluded = new Set(['/dashboard', '/report-templates']);

for (const entry of seo.routes.filter(
  (item) => item.index === true && item.canonical === item.path && !prerenderExcluded.has(item.path)
)) {
  const routeDir = entry.path === '/' ? dist : path.join(dist, entry.path.slice(1));
  const file = path.join(routeDir, 'index.html');
  if (!fs.existsSync(file)) fail(`missing prerendered HTML for ${entry.path}`);

  const html = fs.readFileSync(file, 'utf8');
  const title = htmlText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = htmlText(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ?? '');
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i)?.[1] ?? '';
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i)?.[1] ?? '';
  const rootMatch = html.match(/<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>\s*<script/i);
  const body = htmlText(rootMatch?.[1] ?? '');
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => htmlText(m[1]));

  if (title !== entry.title) fail(`${entry.path} title does not match seo-routes.json`);
  if (description !== entry.description) fail(`${entry.path} description does not match seo-routes.json`);
  if (canonical !== seo.siteUrl + entry.canonical) fail(`${entry.path} canonical is incorrect`);
  if (entry.index && !/^index,\s*follow$/i.test(robots)) fail(`${entry.path} must be index, follow`);
  if (!entry.index && !/^noindex,\s*nofollow$/i.test(robots)) fail(`${entry.path} must be noindex, nofollow`);
  if (h1s.length !== 1) fail(`${entry.path} must contain exactly one H1 (found ${h1s.length})`);
  if (entry.index && body.length < 700) fail(`${entry.path} has too little prerendered body content (${body.length} chars)`);

  const blocks = [...html.matchAll(/<(?:h2|h3|p)>[\s\S]*?<\/(?:h2|h3|p)>/gi)]
    .map((m) => htmlText(m[0]))
    .filter((block) => block.length >= 40);
  const uniqueBlocks = [...new Set(blocks)];
  if (entry.index) seenBodies.set(entry.path, uniqueBlocks);
}

const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expectedLocs = canonicalIndexable.map((entry) => seo.siteUrl + entry.path);
if (sitemapLocs.length !== expectedLocs.length) fail(`sitemap has ${sitemapLocs.length} URLs but ${expectedLocs.length} indexable routes are configured`);
for (const loc of expectedLocs) {
  if (!sitemapLocs.includes(loc)) fail(`sitemap is missing ${loc}`);
}
for (const loc of sitemapLocs) {
  if (!expectedLocs.includes(loc)) fail(`sitemap contains non-indexable URL ${loc}`);
}

const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
if (!/Sitemap:\s*https:\/\/www\.pathmlt\.com\/sitemap\.xml/i.test(robots)) fail('robots.txt sitemap directive is missing');

const duplicatePairs = [];
const paths = [...seenBodies.keys()];
for (let i = 0; i < paths.length; i += 1) {
  const a = new Set(seenBodies.get(paths[i]));
  for (let j = i + 1; j < paths.length; j += 1) {
    const b = new Set(seenBodies.get(paths[j]));
    const intersection = [...a].filter((item) => b.has(item)).length;
    const base = Math.max(1, Math.min(a.size, b.size));
    if (intersection / base > 0.85) duplicatePairs.push(`${paths[i]} <-> ${paths[j]}`);
  }
}
if (duplicatePairs.length) {
  fail(`near-duplicate indexable content detected: ${duplicatePairs.join(', ')}`);
}

console.log(`SEO validation passed: ${canonicalIndexable.length} indexable routes, sitemap and prerendered metadata/content verified.`);
