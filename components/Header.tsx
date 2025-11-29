"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">
              ResolveForge
            </span>
          </Link>
        </div>

        {/* Right side: Login always visible + desktop nav + mobile menu toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link href="/#how-it-works" className="hover:text-slate-900">
              How it works
            </Link>
            <Link href="/#features" className="hover:text-slate-900">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-slate-900">
              Pricing
            </Link>
          </nav>

          {/* Login button – ALWAYS visible, even on mobile */}
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-slate-900 px-4 py-1.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-900 hover:text-white transition-colors"
          >
            Log in
          </Link>

          {/* Mobile menu toggle (only shows on small screens) */}
          <button
            type="button"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="block h-[2px] w-4 bg-slate-800" />
            <span className="mt-1 block h-[2px] w-4 bg-slate-800" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 text-sm font-medium text-slate-700">
            <Link
              href="/#how-it-works"
              className="py-1 hover:text-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="py-1 hover:text-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="py-1 hover:text-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            {/* Duplicate login in mobile menu (optional but nice) */}
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
