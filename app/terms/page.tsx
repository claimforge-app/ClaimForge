export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="w-full border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
            RF
          </div>
          <div>
            <div className="font-semibold tracking-tight">ResolveForge</div>
            <div className="text-xs text-neutral-400 -mt-1">Terms of Use</div>
          </div>
        </div>
        <a
          href="/"
          className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-neutral-800 text-neutral-300 hover:bg-neutral-900 transition"
        >
          Back to homepage
        </a>
      </header>

      <section className="flex-1 px-6 md:px-12 lg:px-20 py-8 md:py-10 max-w-3xl mx-auto space-y-6 text-sm text-neutral-200">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
          Terms of Use
        </h1>
        <p className="text-xs text-neutral-400">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <p>
          ResolveForge is currently in public beta. By using this site, you
          agree to these simple terms during the beta period.
        </p>

        <h2 className="text-lg font-semibold mt-4">1. No legal advice</h2>
        <p>
          ResolveForge is not a law firm and does not provide formal legal
          advice. It uses AI to help you understand general UK consumer,
          tenancy, and data rights and to draft letters you can choose to send.
          You are responsible for checking all letters before sending them and
          for any decisions you make based on them.
        </p>

        <h2 className="text-lg font-semibold mt-4">2. Beta service</h2>
        <p>
          ResolveForge is a beta product. Features may change, break, or be
          removed without notice. We may limit or throttle usage (for example,
          to 5 analyses per month on the free tier) to control costs and protect
          the service.
        </p>

        <h2 className="text-lg font-semibold mt-4">
          3. Fair and lawful use only
        </h2>
        <p>You agree not to use ResolveForge to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Submit fraudulent or misleading complaints.</li>
          <li>Harass, threaten or abuse any person or organisation.</li>
          <li>
            Violate applicable laws or encourage others to do so, including
            defamation or unlawful data access.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-4">4. Your responsibility</h2>
        <p>
          You are responsible for any letters you send or actions you take after
          using ResolveForge. For important, high-value, or time-sensitive
          matters, you should seek advice from a qualified professional (such as
          a solicitor or advice agency).
        </p>

        <h2 className="text-lg font-semibold mt-4">
          5. Accounts and access limits
        </h2>
        <p>
          We may impose limits on free accounts (for example, 5 analyses per
          month) and reserve the right to restrict or suspend accounts that
          abuse the service or exceed reasonable usage.
        </p>

        <h2 className="text-lg font-semibold mt-4">6. Changes to these terms</h2>
        <p>
          As ResolveForge matures, these terms may change. We&apos;ll update the
          date above when we make significant changes. Continuing to use the
          service after changes means you accept the updated terms.
        </p>

        <h2 className="text-lg font-semibold mt-4">7. Contact</h2>
        <p>
          If you have questions about these terms or how ResolveForge works, you
          can contact us at{" "}
          <a
            href="mailto:support@resolveforge.co.uk"
            className="text-yellow-300 underline"
          >
            support@resolveforge.co.uk

          </a>
          .
        </p>

        <p className="text-xs text-neutral-500 mt-6">
          These beta terms are intended to be clear and straightforward, not
          exhaustive legal wording.
        </p>
      </section>
    </main>
  );
}
