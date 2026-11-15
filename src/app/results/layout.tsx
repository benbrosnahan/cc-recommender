import type { Metadata } from 'next';

// The results are worked out in the browser from the quiz answers, so there is
// nothing here for a search engine to index.
export const metadata: Metadata = {
  title: 'Your three cards | Card Picker by Cense',
  alternates: { canonical: '/results' },
  robots: { index: false, follow: true },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
