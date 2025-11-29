"use client";

import { useState, useEffect } from "react";

function LoginOrDashboardButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cookieString = document.cookie || "";
    const hasEmailCookie = cookieString.includes("resolveforge_email=");
    setLoggedIn(hasEmailCookie);
  }, []);

  const href = loggedIn ? "/dashboard" : "/login";
  const label = loggedIn ? "View your past claims" : "Log in";

  return (
    <a
      href={href}
      className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 hover:bg-neutral-900 transition"
    >
      {label}
    </a>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyse = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
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
          <LoginOrDashboardButton />
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
            ResolveForge reads your complaint, finds your rights, and writes a
            powerful letter for you in seconds. Refunds, lost parcels,
            landlords, data rights – all handled by one AI Refund Engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              className="px-5 py-2.5 rounded-full bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-300 transition w-full sm:w-auto"
              onClick={handleAnalyse}
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

          {error && <div className="text-red-400 text-xs">{error}</div>}
        </div>

        {/* Right side – result box */}
        <div className="md:w-1/2 flex items-start">
          <div className="w-full rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-black p-4 sm:p-6 shadow-[0_0_60px_rgba(250,204,21,0.12)]">
            {!result && !loading && (
              <div className="text-neutral-500 text-sm">
                Your AI analysis will appear here.
              </div>
            )}

            {loading && (
              <div className="text-yellow-300 text-sm animate-pulse">
                Analysing your issue...
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
          <button className="hover:text-neutral-300">Privacy</button>
          <button className="hover:text-neutral-300">Terms</button>
          <button className="hover:text-neutral-300">Contact</button>
        </div>
      </footer>
    </main>
  );
}
