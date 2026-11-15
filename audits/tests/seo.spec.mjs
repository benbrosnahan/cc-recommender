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

// SEO-02 and DX-02: Ben chose cense-card-recommender.vercel.app as the one canonical address on 2026-11-15.
// cense.vercel.app keeps serving the same build but must never be named as canonical.
const CANONICAL = 'https://cense-card-recommender.vercel.app';

test('SEO-02 canonical, Open Graph URL, sitemap, robots and structured data all name the chosen domain', async ({ request }) => {
  const home = await (await request.get('/')).text();
  const homeUrl = /^https:\/\/cense-card-recommender\.vercel\.app\/?$/;
  expect(home.match(/<link rel="canonical" href="([^"]*)"/)?.[1]).toMatch(homeUrl);
  expect(home.match(/<meta property="og:url" content="([^"]*)"/)?.[1]).toMatch(homeUrl);
  const cards = await (await request.get('/cards')).text();
  expect(cards.match(/<link rel="canonical" href="([^"]*)"/)?.[1]).toBe(`${CANONICAL}/cards`);
  const data = JSON.parse(home.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1] ?? '{}');
  expect(data.url).toBe(CANONICAL);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${CANONICAL}/sitemap.xml`);
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain(`<loc>${CANONICAL}/</loc>`);
  expect(xml).toContain(`<loc>${CANONICAL}/cards</loc>`);
  for (const text of [home, cards, robots, xml]) expect(text).not.toMatch(/https:\/\/cense\.vercel\.app/);
});
