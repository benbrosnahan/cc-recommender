# Student Card Picker

**Live: [cense-card-recommender.vercel.app](https://cense-card-recommender.vercel.app)**

Five questions, three no-annual-fee card recommendations, each with what it would pay back in
dollars in the first year and in every year after, based on the spending the user just described.

## Why it works this way

Credit card comparison content is almost entirely affiliate-driven, and it is optimized for
the payout rather than the reader. Four decisions push against that:

- **Dollars, not points.** "3x on dining" is unfalsifiable to a 20 year old. "About $234 back
  a year, at your spending" can be checked, and can be wrong, which is the point.
- **Year one, then every year after.** A welcome bonus or a first-year match is paid once.
  Every result splits the headline into the part that comes back each year and the part that
  does not, drawn as one bar on a scale shared by all three cards. When a lower-ranked card
  pays more from year two on, the page says so.
- **No annual fee, full stop.** A premium card can be mathematically better for a heavy
  spender. It is the wrong recommendation for a student building a first credit history, and
  filtering it out at the data layer means the tool cannot drift toward the profitable answer.
- **No affiliate links.** Every link goes to the bank's own page with no tracking parameters.

There is a browsable card universe at `/cards` for people who want to see everything rather
than answer questions, and a worked example at `/results?example=1` for people who want to see
a result before answering anything.

## How it is built

- Next.js App Router, TypeScript, Tailwind. Entrances are CSS keyframes, not a script-driven
  animation library, so a background tab or a slow phone never leaves the page blank.
- Shares its type, colour and spacing tokens with Loan Desk and Decode (`src/app/globals.css`)
- `src/data/cards.ts` is the card dataset, `src/lib/calculator.ts` the earnings model
- `src/lib/copy-generator.ts` produces the per-user explanation of each pick
- Client side only. Only the five answers are kept, in session storage, and nothing is sent anywhere

## Run it

```bash
npm install
npm run dev
```

Part of [Cense](https://cense.beehiiv.com).
