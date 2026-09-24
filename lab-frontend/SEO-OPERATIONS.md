# PathMLT SEO deployment and monitoring

## What the build now validates

The production build generates route-specific HTML for every canonical indexable public route. Each generated page is checked for one H1, a route-specific title and description, the expected canonical URL, the correct robots directive, and meaningful prerendered body text.

The build also regenerates the sitemap from canonical indexable routes and checks that robots.txt advertises that sitemap. Consolidated legacy SEO routes are redirected to their canonical destinations instead of competing as separate indexable pages.

## Pre-deploy

From `lab-frontend/`:

```bash
npm ci
npm run lint
npm run build
```

The build fails when a new SEO route is missing, has duplicate canonical configuration, loses its H1, has too little prerendered content, or falls out of the sitemap.

## Production smoke test

After deployment:

```bash
SEO_SITE_URL=https://www.pathmlt.com npm run seo:production
```

This checks the live sitemap, robots.txt, every canonical indexable URL, metadata, H1 count, response time, and permanent redirects for consolidated aliases.

## Google Search Console

In the verified PathMLT property:

1. Submit `https://www.pathmlt.com/sitemap.xml` in the Sitemaps report.
2. Use URL Inspection on the homepage, `/laboratory-reporting-software`, `/features`, `/diagnostic-lab-software`, and `/pathology-lab-software`.
3. Confirm Google can crawl the live pages, the expected canonical is selected, and the rendered HTML contains the page content.
4. After the new pages are live, request indexing for priority pages and use the sitemap for broader discovery.
5. Monitor Performance by query and page for impressions, clicks, CTR, and average position.
6. Monitor Page Indexing and any structured-data enhancement reports for crawl, canonical, or markup issues.
7. Monitor Core Web Vitals for mobile and desktop after real-user data accumulates, and compare those results with lab measurements from PageSpeed Insights.

## Content maintenance

Keep one canonical URL per search intent. A new landing page should only be added when it provides materially different information for a distinct audience or task. Avoid creating another page that only swaps keywords while repeating the same workflow copy.

For factual product claims such as plan limits, integrations, security controls, or support commitments, update the page when the product behavior or commercial terms change.
