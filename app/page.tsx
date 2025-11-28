export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-black font-bold">
            CF
          </div>
          <div>
            <div className="font-semibold tracking-tight">ClaimForge</div>
            <div className="text-xs text-neutral-400 -mt-1">
              The Refund Engine
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 hover:bg-neutral-900 transition">
            Log in
          </button>
          <button className="px-4 py-1.5 rounded-full bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition">
            Get early access
          </button>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 flex flex-col md:flex-row px-6 md:px-16 py-10 md:py-16 gap-10 md:gap-16">
        {/* Left side – text */}
        <div className="md:w-1/2 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            AI that fights back for you
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
            Stop arguing with
            <span className="text-yellow-400"> customer service</span>. Let AI
            handle it.
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-xl">
            ClaimForge reads your complaint, finds your rights, and writes a
            powerful letter for you in seconds. Refunds, lost parcels,
            landlords, data rights – all handled by one AI Refund Engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button className="px-5 py-2.5 rounded-full bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-300 transition w-full sm:w-auto">
              Try the demo (coming soon)
            </button>
            <p className="text-xs text-neutral-400">
              No credit card. No legal jargon. Just results.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              Refunds &amp; faulty goods
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              Landlords &amp; repairs
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              Lost parcels &amp; delays
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              Data &amp; DSAR rights
            </div>
          </div>
        </div>

        {/* Right side – mock “Claim box” */}
        <div className="md:w-1/2 flex items-center">
          <div className="w-full rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-black p-4 sm:p-6 shadow-[0_0_60px_rgba(250,204,21,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Quick demo
                </div>
                <div className="text-sm text-neutral-200">
                  Paste your problem below:
                </div>
              </div>
              <div className="h-8 px-3 rounded-full border border-amber-400/40 bg-amber-400/10 text-[11px] flex items-center text-amber-200">
                Beta · Coming soon
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                disabled
                rows={4}
                className="w-full resize-none rounded-xl border border-neutral-800 bg-black/60 px-3 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none"
                placeholder="Example: ‘EVRi lost my parcel and the retailer says it’s not their problem. I’ve been going in circles for weeks and they keep fobbing me off…’"
              />

              <button className="w-full rounded-lg bg-neutral-800 text-xs py-2 text-neutral-400 cursor-not-allowed">
                Analyse &amp; draft letter (disabled in preview)
              </button>

              <div className="mt-4 border-t border-neutral-800 pt-4 space-y-2">
                <div className="text-xs text-neutral-400">
                  In the live version, ClaimForge will:
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                  <li>Detect what went wrong and who is responsible</li>
                  <li>Explain your rights in plain English</li>
                  <li>Generate a powerful complaint/refund letter</li>
                  <li>Tell you exactly what to do next if they ignore you</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-6 py-4 text-[11px] text-neutral-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} ClaimForge. All rights reserved.</div>
        <div className="flex gap-4">
          <button className="hover:text-neutral-300">Privacy</button>
          <button className="hover:text-neutral-300">Terms</button>
          <button className="hover:text-neutral-300">Contact</button>
        </div>
      </footer>
    </main>
  );
}
