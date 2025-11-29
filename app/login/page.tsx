"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [betaCode, setBetaCode] = useState(""); // beta access code
  const [betaVerified, setBetaVerified] = useState(false); // has this device already passed beta gate?
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔁 On mount, check if this device has already passed the beta gate
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = window.localStorage.getItem("rf_beta_verified");
    if (flag === "true") {
      setBetaVerified(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    const requiredCode = process.env.NEXT_PUBLIC_RF_BETA_CODE;

    // 🔐 Only enforce beta code if this device has NOT passed the gate yet
    if (!betaVerified && requiredCode && betaCode.trim() !== requiredCode) {
      setError(
        "ResolveForge is currently invite-only. Please enter the beta access code we sent you."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          betaCode: betaCode.trim(), // sent along in case API wants to enforce too
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      // 🎟️ On first successful login with a valid beta code, mark this device as verified
      if (!betaVerified && typeof window !== "undefined") {
        window.localStorage.setItem("rf_beta_verified", "true");
        setBetaVerified(true);
      }

      // Success → go to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
            RF
          </div>
          <div>
            <div className="font-semibold tracking-tight">ResolveForge</div>
            <div className="text-xs text-neutral-400 -mt-1">
              Secure access to your claims
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-2">
          Sign in or create an account
        </h1>
        <p className="text-xs text-neutral-400 mb-4">
          Use the same email and password next time to see your past claims.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              placeholder="At least 6 characters"
            />
          </div>

          {/* Beta access code – required only on first successful login on this device */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">
              Beta access code
            </label>
            <input
              type="text"
              value={betaCode}
              onChange={(e) => setBetaCode(e.target.value)}
              placeholder="Your invite code"
              className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <p className="mt-1 text-xs text-neutral-500">
              ResolveForge is currently invite-only. Use the code we sent you.
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-2.5 rounded-full bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing you in…" : "Continue"}
          </button>

          <p className="text-[11px] text-neutral-500 mt-2">
            By continuing you agree to keep your login details secure and not
            share access to your claims with anyone else.
          </p>
        </form>
      </div>
    </main>
  );
}
