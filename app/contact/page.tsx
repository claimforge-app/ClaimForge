"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please fill in your name, email address and message.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            "We couldn’t send your message right now. Please try again."
        );
        setLoading(false);
        return;
      }

      setSuccessMessage(
        data.message ||
          "Thanks for getting in touch. We’ll reply as soon as we can."
      );
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Unexpected error sending your message. Please try again shortly."
      );
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
            RF
          </div>
          <div>
            <div className="font-semibold tracking-tight">ResolveForge</div>
            <div className="text-xs text-neutral-400 -mt-1">
              Contact the team
            </div>
          </div>
        </div>
        <a
          href="/"
          className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-neutral-800 text-neutral-300 hover:bg-neutral-900 transition"
        >
          Back to homepage
        </a>
      </header>

      {/* Content */}
      <section className="flex-1 px-6 md:px-12 lg:px-20 py-8 md:py-10 flex justify-center">
        <div className="w-full max-w-xl space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              Get in touch
            </h1>
            <p className="text-sm text-neutral-400">
              Have feedback about ResolveForge, found a bug, or want to ask a
              question about the beta? Use the form below and we&apos;ll get
              back to you via email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-neutral-300" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-black/60 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-black/60 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-black/60 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none resize-none"
                placeholder="Tell us what’s happening, what you’d like to see next, or any issues you’ve run into."
              />
            </div>

            {errorMessage && (
              <div className="text-xs rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="text-xs rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-300 transition disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>

          <p className="text-[11px] text-neutral-500">
            We&apos;ll reply from{" "}
            <span className="text-neutral-300 font-mono">
              support@resolveforge.co.uk
            </span>{" "}
            as soon as we can.
          </p>
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
          <a
            href="mailto:support@resolveforge.co.uk"
            className="hover:text-neutral-300"
          >
            Email support
          </a>
        </div>
      </footer>
    </main>
  );
}
