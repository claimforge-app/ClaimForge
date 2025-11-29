"use client";

import { useState, useEffect } from "react";

function AuthButtons() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cookieString = document.cookie || "";
    const hasEmailCookie = cookieString.includes("resolveforge_email=");
    setLoggedIn(hasEmailCookie);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/logout", {
        method: "POST",
      });
      // Hard refresh to clear UI state & go back to home as logged-out
      window.location.href = "/";
    } catch (err) {
      setLoggingOut(false);
    }
  };

  if (!loggedIn) {
    return (
      <a
        href="/login"
        className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 hover:bg-neutral-900 transition"
      >
        Log in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/dashboard"
        className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 hover:bg-neutral-900 transition"
      >
        View your past claims
      </a>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="px-3 py-1.5 rounded-full border border-neutral-800 text-xs sm:text-sm text-neutral-300 hover:bg-neutral-900 transition disabled:opacity-60"
      >
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Early access state
  const [earlyOpen, setEarlyOpen] = useState(false);
  const [earlyEmail, setEarlyEmail] = useState("");
  const [earlyLoading, setEarlyLoading] = useState(false);
  const [earlyMessage, setEarlyMessage] = useState<string | null>(null);
  const [earlyError, setEarlyError] = useState<string | null>(null);

  // Usage summary state
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    month: string;
    plan: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/usage", {
          method: "GET",
        });

        if (!res.ok) {
          // 401 if not logged in – just ignore silently
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setUsage(data);
        }
      } catch (err) {
        console.warn("Failed to fetch usage:", err);
      }
    };

    fetchUsage();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnalyse = async () => {
    // Basic validation first
    if (!text.trim() || text.trim().length < 20) {
      setError(
        "Please enter a proper complaint (at least a few sentences so ResolveForge can analyse it properly)."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Handle beta / auth / limit cases
        if (res.status === 401) {
          setError(
            data.error ||
              "ResolveForge is in beta. Please log in or create a free account to use the AI (5 free analyses per month)."
          );
        } else if (res.status === 403) {
          const used = data.used ?? 5;
          const limit = data.limit ?? 5;
          const month = data.month ?? "this month";

          setError(
            data.error ||
              `You’ve used your ${limit} free analyses for ${month}. ResolveForge is in beta – more features and higher tiers are being developed and will be available soon.`
          );
        } else {
          setError(
            data.error || "Something went wrong. Please try again in a moment."
          );
        }

        setLoading(false);
        return;
      }

      // Success – show result
      setResult(data);

      // Optionally refetch usage after a successful analysis to update the counter
      try {
        const usageRes = await fetch("/api/usage");
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData);
        }
      } catch (err) {
        console.warn("Failed to refresh usage after analyse:", err);
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error talking to ResolveForge. Please try again.");
    }

    setLoading(false);
  };

  const handleEarlyAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEarlyError(null);
    setEarlyMessage(null);

    if (!earlyEmail.trim()) {
      setEarlyError("Please enter your email address.");
      return;
    }

    setEarlyLoading(true);

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: earlyEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setEarlyError(
          data.error || "We couldn’t save your email. Please try again."
        );
        setEarlyLoading(false);
        return;
      }

      setEarlyMessage(
        data.message ||
          "You’re on the ResolveForge early access list. We’ll email you when new features and tiers go live."
      );
      setEarlyEmail("");
    } catch (err) {
      console.error(err);
      setEarlyError(
        "Unexpected error while saving your email. Please try again shortly."
      );
    }

    setEarlyLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
            RF
          </div>
          <div>
            <div className="font-semibold tracking-tight">ResolveForge</div>
            <div className="text-xs text-neutral-400 -mt-1">
              The Refund Engine
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <AuthButtons />
          <button
            className="px-4 py-1.5 rounded-full bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition"
            onClick={() => setEarlyOpen((prev) => !prev)}
          >
            Get early access
          </button>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 flex flex-col md:flex-row px-6 md:px-16 py-10 md:py-16 gap-10 md:gap-16">
        {/* Left side – text */}
        <div className="md:w-1/2 flex flex-col justify-center space-y-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              AI that fights back for you
            </div>

            {/* Beta banner */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] text-yellow-200 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
              <span>
                <strong>ResolveForge Beta:</strong> free accounts get{" "}
                <strong>5 AI analyses per month</strong>. More features and
                higher tiers are being developed and will be available soon.
              </span>
            </div>

            {/* Usage pill (only if we have data) */}
            {usage && (
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-[11px] text-neutral-200 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                <span>
                  This month:{" "}
                  <strong>
                    {usage.used} / {usage.limit}
                  </strong>{" "}
                  analyses used
                </span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
            Stop arguing with
            <span className="text-yellow-400"> customer service</span>. Let AI
            handle it.
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-xl">
            ResolveForge reads your complaint, finds your rights, and writes a
            powerful letter for you in seconds. Refunds, lost parcels,
            landlords, data rights – all handled by one AI Refund Engine.
          </p>

          {/* Early access mini form */}
          {earlyOpen && (
            <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-3 text-xs space-y-2 max-w-md">
              <p className="text-neutral-300">
                Drop your email to get early access updates, new feature
                announcements, and launch offers.
              </p>
              <form
                onSubmit={handleEarlyAccessSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  value={earlyEmail}
                  onChange={(e) => setEarlyEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-full border border-neutral-700 bg-black/70 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={earlyLoading}
                  className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold text-xs hover:bg-yellow-300 transition disabled:opacity-60"
                >
                  {earlyLoading ? "Joining…" : "Join waitlist"}
                </button>
              </form>
              {earlyError && (
                <p className="text-red-300 text-[11px]">{earlyError}</p>
              )}
              {earlyMessage && (
                <p className="text-emerald-300 text-[11px]">{earlyMessage}</p>
              )}
              <p className="text-[10px] text-neutral-500">
                We’ll only use this to email you about ResolveForge updates and
                launches. No spam.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mt-4">
            <button
              className="px-5 py-2.5 rounded-full bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-300 transition w-full sm:w-auto disabled:opacity-60"
              onClick={handleAnalyse}
              disabled={loading}
            >
              {loading ? "Analysing…" : "Analyse my issue"}
            </button>
            <p className="text-xs text-neutral-400">
              Paste your issue below first.
            </p>
          </div>

          <div>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full resize-none rounded-xl border border-neutral-800 bg-black/60 px-3 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none"
              placeholder="Example: ‘EVRi lost my parcel and the retailer says it’s not their problem…’"
            />
          </div>

          {error && (
            <div className="text-xs mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Right side – result box */}
        <div className="md:w-1/2 flex items-start">
          <div className="w-full rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-black p-4 sm:p-6 shadow-[0_0_60px_rgba(250,204,21,0.12)]">
            {!result && !loading && !error && (
              <div className="text-neutral-500 text-sm">
                Your AI analysis will appear here.
              </div>
            )}

            {loading && (
              <div className="text-yellow-300 text-sm animate-pulse">
                Analysing your issue...
              </div>
            )}

            {!loading && !result && error && (
              <div className="text-neutral-500 text-sm">
                Once your issue is analysed, you&apos;ll see a summary and
                draft letter here.
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-500">
                    Detected Issue
                  </div>
                  <div className="text-neutral-200 text-sm font-medium">
                    {result.issueType}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-500">
                    Summary
                  </div>
                  <div className="text-neutral-300 text-sm whitespace-pre-wrap">
                    {result.summary}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-500">
                    Draft Letter
                  </div>
                  <div className="text-neutral-300 text-sm whitespace-pre-wrap">
                    {result.letter}
                  </div>
                </div>
                {/* 👉 PASTE DISCLAIMER HERE */}
    <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">
      <strong>Disclaimer:</strong> ResolveForge is a beta tool and does not
      provide formal legal advice. It uses AI to analyse consumer, tenancy and
      data-rights issues based on general UK principles. Always review your
      letters carefully and seek independent legal advice for important or
      urgent matters.
    </p>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-6 py-4 text-[11px] text-neutral-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
  <div>
    © {new Date().getFullYear()} ResolveForge. All rights reserved.
  </div>
  <div className="flex gap-4">
    <a href="/privacy" className="hover:text-neutral-300">
      Privacy
    </a>
    <a href="/terms" className="hover:text-neutral-300">
      Terms
    </a>
    <a href="/contact" className="hover:text-neutral-300">
  Contact
</a>
  </div>
</footer>

    </main>
  );
}
