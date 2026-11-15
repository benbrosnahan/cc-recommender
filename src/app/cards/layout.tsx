import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Every card we compare | Card Picker by Cense',
  description:
    'The no-annual-fee credit cards Card Picker chooses from, with their rates, bonuses and fees, and the cards we looked at and left out.',
  alternates: { canonical: '/cards' },
};

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
