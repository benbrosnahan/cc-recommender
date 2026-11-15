# Card Picker audit, 15 November 2026

What was checked, what was wrong, and what changed on branch `audit-redesign`. The scans and tests are adapted from the Loan Desk audit kit (see [README](../README.md) and `tests/`).

## Scoreboard

| Measure | Live, before (`results/2026-11-15-live`) | Local build, after (`results/2026-11-15-local`) |
|---|---|---|
| Lighthouse, all four pages | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Security headers check | 40 | 80 (only HSTS missing, which Vercel adds over HTTPS) |
| GEO (AI search readiness) | 60 | 80 |
| Meta check | 73 | 87 |
| Sitemap | not found | found |
| Design heuristic | 85 | 89 |
| Sideways scroll at five widths | 0 of 10 | 0 of 10 |
| First real content readable | 1,972 ms | 1,725 ms |
| Playwright suite (78 tests) | 20 pass, 58 fail | 78 pass (2 known issues fail as expected) |
| Money tests (37) | all fail | all pass |

Lighthouse ran once per page on a shared machine, so treat small timing moves as noise.

## Card terms

Every active card (13) and the four left out were checked on the issuer's own page on 15 November 2026, rendered in a browser: annual fee, reward rates, caps, sign-up bonus, foreign transaction fee and credit level. Everything not listed below matched. The app shows no APRs, so none were compared. Bank of America's pages refuse automated browsers (MONEY-18).

## Hand checks

Each figure was computed by hand, by an independent oracle written from the issuers' terms (`tests/support/money-oracle.mjs`), and by the app after the fix. All three agree.

| Student | Card | Year one | Every year after | Live site showed |
|---|---|---|---|---|
| A, the example: no credit history, eating out and groceries, $750 a month | Discover it Cash Back | $406 | $203 | $468 / $234 |
| | Capital One Savor Student | $284 | $234 | |
| | Discover it Chrome | $260 | $130 | |
| B: score 670 to 739, online shopping, eating out and groceries, $1,500 a month, spends abroad | Discover it Cash Back | $648 | $324 | $840 / $420 |
| | BofA Customized Cash | $639 | $239 | $660 / $244 |
| | Chase Freedom Flex | $617 | $417 | $730 / $480 |
| C: no credit history, coffee, streaming and transit, $300 a month, wants it simple | Capital One Savor Student | $136 | $86 | $108 / $58 |
| | Capital One Quicksilver Student | $104 | $54 | |
| | Discover it Cash Back | $152 | $76 | |

## Issues

P0: a student gets a wrong number or advice that could cost money. P1: misleading or a real risk, unlikely to cost money. P2 and P3: quality.

| ID | Sev | Issue | Status | Source |
|---|---|---|---|---|
| MONEY-01 | P0 | Rotating 5% categories were assumed to match half the year for every spending category. On the example the page showed Discover at $468 and $234 (correct: $406 and $203) and said Savor pays "the same" from year two when it pays $31 more. | Fixed: each bank's 2026 calendar, quarter by quarter | discover.com/credit-cards/cash-back/cashback-calendar.html; media.chase.com (2026 Q1 and Q2 categories); creditcards.chase.com/cash-back-credit-cards/freedom/flex |
| MONEY-02 | P0 | Freedom Flex bonus shown as $250; Chase offers $200 after $500 in 3 months | Fixed | creditcards.chase.com/cash-back-credit-cards/freedom/flex |
| MONEY-03 | P1 | VentureOne offered to the 670 to 739 band; Capital One lists it for excellent credit | Fixed | capitalone.com/credit-cards/ventureone/ |
| MONEY-04 | P1 | Coffee earned the base rate, but issuers code cafes as dining. Student C's Savor showed $108 instead of $136 | Fixed | disclosures.capitalone.com/disclosure.42664.en-US.html; Discover's terms (restaurants include cafes) |
| SEC-01 | P1 | No CSP, nosniff, frame, referrer or permissions headers | Fixed | Kit scan |
| SEC-02 | P1 | Next.js 16.2.4 had 33 advisories, 5 critical | Fixed: 16.4.3, a minor release, in its own commit | npm audit |
| A11Y-02 | P1 | Brand link 28px tall, under the 40px tap floor | Fixed | Cense design floors |
| MONEY-05 | P2 | Citi Double Cash bonus shown as $1,500 in 6 months; it is $500 in 3 months | Fixed | citi.com/credit-cards/citi-double-cash-credit-card |
| MONEY-06 | P2 | A shared quarterly cap was filled in quiz order instead of pro rata (BofA $660, correct $639) | Fixed | bankofamerica.com student cash back card page |
| MONEY-07 | P2 | No date saying when card terms were checked | Fixed: "Card terms checked on 15 November 2026" on results and /cards | |
| MONEY-08 | P2 | BofA's choice list missed travel, and streaming inside online shopping | Fixed | BofA card page |
| MONEY-09 | P2 | Labels said 700+ while the quiz said 740+, and read as published minimum scores | Fixed: the quiz's own bands; issuers publish no minimum | |
| MONEY-10 | P2 | "Rather not say" is treated as 670 to 739 | Hint copy fixed; the default is Ben's decision | |
| MONEY-11 | P2 | The travel priority adds $200 of value for Chase points that only transfer with an annual-fee Sapphire card | Needs Ben | Chase Freedom pages |
| MONEY-12 | P2 | Stale or overstated copy: Discover "Amazon", Savor "guaranteed bonus" and "highest rates", Rise "significantly", unused 5% travel rates in the data | Fixed | Issuer pages |
| MONEY-18 | P2 | BofA blocks automated reads: the Customized Cash foreign fee (app: 3%, matching third-party reviews) and the BankAmericard for Students page (404) are unconfirmed | Needs Ben to check in a normal browser | |
| SEO-01 | P2 | No robots.txt or sitemap | Fixed | Kit |
| SEO-02 | P2 | No canonical link; the same build is served at cense.vercel.app and cense-card-recommender.vercel.app | Canonical set to cense.vercel.app; the domain choice is Ben's | Kit |
| SEO-03 | P2 | No structured data | Fixed: WebApplication JSON-LD | Kit GEO |
| A11Y-01 | P2 | Radio questions ignore arrow keys | Known issue, has a test | WAI-ARIA radio group pattern |
| UX-01 | P2 | Phone buttons were not full width | Fixed | Design system |
| MONEY-13 | P3 | "Stays on gas if you never pick" is not on BofA's page | Fixed | |
| MONEY-14 | P3 | A spending option suggested putting rent on a card | Fixed | |
| MONEY-15 | P3 | Two "why" bullets were not supported by the student's answers | Fixed | |
| MONEY-16 | P3 | Freedom Unlimited counted as flat-rate for "keep it simple" | Known issue | |
| MONEY-17 | P3 | The 2026 rotating calendars go stale in January 2027 | Known issue: update `rotating` in `src/data/cards.ts` and `tests/support/card-terms.mjs` together | |
| SEC-03 | P3 | Two build-time advisories (source-map-js, baseline-browser-mapping) | Known issue | npm audit |
| SEO-04 | P3 | No og:image | Known issue, has a test | |
| SEO-05 | P3 | /cards and /results reused the home title; /results was indexable | Fixed | |
| A11Y-03 | P3 | No nav landmark | Fixed | |
| UX-02 | P3 | "Dining" in badges, "eating out" elsewhere | Fixed | |
| DX-01 | P3 | The kit's flow, interaction-latency and form-state steps are written for Loan Desk | Known issue | |
| DX-02 | P3 | README names cense-card-recommender.vercel.app as the live URL | Needs Ben (with SEO-02) | |

## Design

Direction: Loan Desk's quiet cream-and-green ledger applied to a card comparison. The signature element is the split earnings bar: every-year rewards in solid green, first-year-only money hatched in orange, all three picks on one scale. Before and after screenshots at 375 and 1440 wide are kept on disk in `screenshots/` (not in git).

## Not covered

- Bank of America's pages (MONEY-18) and the kit's interactive steps (DX-01).
- Security headers over HTTPS, until a deploy.
- The CSP blocks the Vercel toolbar on deployments.
