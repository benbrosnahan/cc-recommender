import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/shared/Nav';
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cense — Find Your Student Credit Card',
  description:
    'Answer 5 questions. Get 3 personalized no-annual-fee card picks with a real-dollar year-one earnings estimate — not points, not generic lists.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-slate-900">
        <Nav />
        <main className="flex-1">{children}</main>
        <DisclaimerBanner />
      </body>
    </html>
  );
}
