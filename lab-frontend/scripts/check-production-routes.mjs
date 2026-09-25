import process from 'node:process';

const siteUrl = (process.env.SEO_SITE_URL || 'https://www.pathmlt.com').replace(/\/$/, '');
const timeoutMs = Number(process.env.SEO_HTTP_TIMEOUT_MS || 15_000);
const privateRoutes = ['/privacy', '/terms', '/login', '/signup', '/forgot-password', '/dashboard', '/report-templates'];

async function get(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'user-agent': 'PathMLT-SEO-Route-Check/1.0' },
    });
  } finally {
    clearTimeout(timer);
  }
}

function fail(message) {
  throw new Error(`Production route check failed: ${message}`);
}

const sitemapResponse = await get(`${siteUrl}/sitemap.xml`);
if (!sitemapResponse.ok) fail(`/sitemap.xml returned HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!urls.length) fail('sitemap contains no URLs');

const checked = [];
for (const url of urls) {
  const response = await get(url);
  if (!response.ok) fail(`${url} returned HTTP ${response.status}`);
  const html = await response.text();
  const canonical = html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? '';
  const robots = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? '';
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (canonical !== url) fail(`${url} has canonical ${canonical || '(missing)'}`);
  if (!/^index,\s*follow$/i.test(robots)) fail(`${url} is not index, follow`);
  if (!title.trim()) fail(`${url} has no title`);
  if (h1Count !== 1) fail(`${url} has ${h1Count} H1 elements`);
  checked.push(url);
}

for (const route of privateRoutes) {
  const url = `${siteUrl}${route}`;
  const response = await get(url);
  if (response.status !== 200) fail(`${url} returned HTTP ${response.status}; expected 200 for direct navigation`);
  const robotsHeader = response.headers.get('x-robots-tag') || '';
  const html = await response.text();
  const robotsMeta = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? '';
  if (!/noindex/i.test(`${robotsHeader} ${robotsMeta}`)) fail(`${url} is missing noindex protection`);
}

console.log(`Production route check passed: ${checked.length} sitemap URLs and ${privateRoutes.length} private routes verified.`);
