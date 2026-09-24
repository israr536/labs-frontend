import fs from 'node:fs';
import { performance } from 'node:perf_hooks';

const seo = JSON.parse(fs.readFileSync('src/seo/seo-routes.json', 'utf8'));
const siteUrl = (process.env.SEO_SITE_URL || seo.siteUrl).replace(/\/$/, '');
const fail = (message) => { throw new Error('Production SEO check failed: ' + message); };

const decodeHtml = (value) => value
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();

const decodeEntities = (value) => value
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const get = async (url, options = {}) => {
  const started = performance.now();
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: {
      'user-agent': 'PathMLT-SEO-Validator/1.0',
      accept: 'text/html,application/xml,text/plain;q=0.9,*/*;q=0.8',
      ...(options.headers || {}),
    },
  });
  return { response, ms: performance.now() - started };
};

const indexable = seo.routes.filter((entry) => entry.index && entry.canonical === entry.path);
const aliases = [
  ...seo.routes.filter((entry) => entry.path !== entry.canonical),
  { path: '/faq', canonical: '/faqs' },
];

const robots = await get(siteUrl + '/robots.txt');
if (!robots.response.ok) fail('robots.txt returned HTTP ' + robots.response.status);
const robotsText = await robots.response.text();
const escapedSite = siteUrl.replaceAll('.', '\\.');
if (!new RegExp('Sitemap:\\s*' + escapedSite + '\\/sitemap\\.xml', 'i').test(robotsText)) {
  fail('robots.txt does not advertise the expected sitemap URL');
}

const sitemap = await get(siteUrl + '/sitemap.xml');
if (!sitemap.response.ok) fail('sitemap.xml returned HTTP ' + sitemap.response.status);
const sitemapText = await sitemap.response.text();
const sitemapLocs = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedLocs = indexable.map((entry) => siteUrl + entry.path);
for (const loc of expectedLocs) if (!sitemapLocs.includes(loc)) fail('sitemap is missing ' + loc);
if (sitemapLocs.length !== expectedLocs.length) fail('sitemap has ' + sitemapLocs.length + ' URLs; expected ' + expectedLocs.length);

const results = [];
for (const entry of indexable) {
  const result = await get(siteUrl + entry.path);
  if (!result.response.ok) fail(entry.path + ' returned HTTP ' + result.response.status);

  const finalUrl = result.response.url.replace(/\/$/, '');
  const html = await result.response.text();
  const title = decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = decodeEntities(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ?? '');
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i)?.[1] ?? '';
  const robotsMeta = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i)?.[1] ?? '';
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const bodyText = decodeHtml(html);

  if (finalUrl !== (siteUrl + entry.path).replace(/\/$/, '')) fail(entry.path + ' unexpectedly resolves to ' + result.response.url);
  if (title !== entry.title) fail(entry.path + ' has an unexpected title');
  if (description !== entry.description) fail(entry.path + ' has an unexpected description');
  if (canonical !== siteUrl + entry.canonical) fail(entry.path + ' has an unexpected canonical ' + canonical);
  if (!/^index,\s*follow$/i.test(robotsMeta)) fail(entry.path + ' is not index, follow');
  if (h1Count !== 1) fail(entry.path + ' has ' + h1Count + ' H1 elements');

  results.push({
    path: entry.path,
    status: result.response.status,
    responseMs: Math.round(result.ms),
    bodyChars: bodyText.length,
  });
}

for (const alias of aliases) {
  const result = await get(siteUrl + alias.path, { redirect: 'manual' });
  if (![301, 308].includes(result.response.status)) {
    fail(alias.path + ' should redirect permanently to ' + alias.canonical + ', got HTTP ' + result.response.status);
  }
  const location = result.response.headers.get('location') || '';
  if (!location.endsWith(alias.canonical)) fail(alias.path + ' redirects to ' + location + ', expected ' + alias.canonical);
  console.log('redirect ok  ' + alias.path + ' -> ' + alias.canonical + ' (' + result.response.status + ', ' + Math.round(result.ms) + 'ms)');
}

const averageResponseMs = Math.round(results.reduce((sum, item) => sum + item.responseMs, 0) / Math.max(1, results.length));
console.table(results);
console.log('Production SEO HTTP check passed for ' + results.length + ' indexable URLs. Average response: ' + averageResponseMs + 'ms.');
console.log('For Core Web Vitals, run PageSpeed Insights on mobile and desktop and monitor Search Console Core Web Vitals after real-user traffic is collected.');
