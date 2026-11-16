export function DisclaimerBanner() {
  return (
    <footer className="mx-auto mt-14 w-full max-w-3xl px-4 pb-10 sm:px-6">
      <div className="border-t border-line pt-6">
        <p className="text-sm font-semibold leading-relaxed text-slate-800">
          Nobody pays Cense when you apply for a card. The links go straight to each bank&apos;s own
          page, and nothing you answer here leaves your browser.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          These are estimates, not financial advice. Banks change card terms without notice, so
          read the offer on the bank&apos;s page before you apply. A credit card only pays you if
          you clear the full balance every month. Interest costs more than any reward here.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Built by{' '}
          <a
            href="https://cense.beehiiv.com"
            className="font-semibold text-slate-900 underline decoration-brand-border underline-offset-4 hover:decoration-navy"
          >
            Cense
          </a>
          , a free weekly personal finance newsletter for people who had to learn this alone.
        </p>
      </div>
    </footer>
  );
}
