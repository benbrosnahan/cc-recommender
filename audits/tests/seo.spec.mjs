// SEO basics: titles, descriptions, canonical links, robots.txt, sitemap.xml and structured data in the raw
// HTML a crawler or an AI assistant reads before any script runs.
import { test, expect, knownIssue } from './helpers.mjs';

const PAGES = {
  '/': { title: /Card Picker by Cense/, canonical: /^https:\/\/[^/]+\/?$/ },
  '/cards': { title: /Every card we compare/, canonical: /\/cards$/ },
};

for (const [path, want] of Object.entries(PAGES)) {
  test(`raw HTML of ${path}: title, description, canonical, one h1`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    expect(html).toMatch(/<html lang="en"/);
    expect(html.match(/<title>([^<]*)<\/title>/)?.[1]).toMatch(want.title);
    expect(html).toMatch(/<meta name="description" content="[^"]{50,}"/);
    expect(html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]).toMatch(want.canonical);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });
}

test('robots.txt allows crawling and names the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/Allow: \//);
  expect(text).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
});

test('sitemap.xml lists the home page and the cards page', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toMatch(/<loc>https:\/\/[^<]+\/<\/loc>/);
  expect(xml).toMatch(/<loc>https:\/\/[^<]+\/cards<\/loc>/);
});

test('structured data says what the app is', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const block = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1];
  expect(block).toBeTruthy();
  const data = JSON.parse(block);
  expect(data['@type']).toBe('WebApplication');
  expect(data.offers.price).toBe('0');
});

test('results are kept out of search results', async ({ request }) => {
  const html = await (await request.get('/results')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('SEO-04 a social card image is set', async ({ request }) => {
  knownIssue('SEO-04');
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<meta property="og:image"/);
});
