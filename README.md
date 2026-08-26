# Student Card Picker

**Live: [cense-card-recommender.vercel.app](https://cense-card-recommender.vercel.app)**

Five questions, three no-annual-fee card recommendations, each with an estimated first-year
return in dollars based on the spending the user just described.

## Why it works this way

Credit card comparison content is almost entirely affiliate-driven, and it is optimized for
the payout rather than the reader. Two decisions push against that:

- **Dollars, not points.** "3x on dining" is unfalsifiable to a 20 year old. "About $94 back
  in year one, at your spending" can be checked, and can be wrong, which is the point.
- **No annual fee, full stop.** A premium card can be mathematically better for a heavy
  spender. It is the wrong recommendation for a student building a first credit history, and
  filtering it out at the data layer means the tool cannot drift toward the profitable answer.

There is also a browsable card universe at `/cards` for people who want to see everything
rather than answer questions, because a quiz that traps you in a funnel is a quiz people leave.

## How it is built

- Next.js App Router, TypeScript, Tailwind, Framer Motion
- `src/data/cards.ts` is the card dataset, `src/lib/calculator.ts` the earnings model
- `src/lib/copy-generator.ts` produces the per-user explanation of each pick
- Client side only, nothing stored

## Run it

```bash
npm install
npm run dev
```

Built with Claude Code. Part of [Cense](https://cense.beehiiv.com).
