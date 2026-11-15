import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/shared/Nav';
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Two faces, shared with Loan Desk and Decode so the Cense tools read as one
// family. Bricolage carries headlines and headline figures. Instrument Sans
// carries everything that gets read or compared, and has true tabular figures.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});
const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: 'Card Picker by Cense: your first credit card, in dollars',
  description:
    'Five questions, three no-annual-fee credit cards, and what each would pay you back in the first year and every year after. No affiliate links.',
  openGraph: {
    title: SITE_NAME,
    url: '/',
    siteName: 'Cense',
    description:
      'Your first credit card, in dollars instead of points. Five questions, three no-annual-fee picks.',
    type: 'website',
  },
};

// What the page is, for search engines and AI assistants that read raw HTML.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  description:
    'Five questions, three no-annual-fee credit cards for students, and what each would pay back in the first year and every year after. No affiliate links.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Cense', url: 'https://cense.beehiiv.com' },
};

export const viewport: Viewport = {
  themeColor: '#FFFCEC',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          // Static, written here: no user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <DisclaimerBanner />
      </body>
    </html>
  );
}
