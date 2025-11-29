import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const FREE_ANALYSIS_LIMIT_PER_MONTH = 5;

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Turn "2025-11" into "November 2025"
function formatMonthKey(monthKey: string): string {
  try {
    const [yearStr, monthStr] = monthKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!year || !month) return monthKey;

    const date = new Date(Date.UTC(year, month - 1, 1));
    return date.toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return monthKey;
  }
}

export default async function DashboardPage() {
  // 🔐 Read user ID from cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("resolveforge_user_id")?.value || null;

  if (!userId) {
    redirect("/login?from=/dashboard");
  }

  const monthKey = getCurrentMonthKey();
  const displayMonth = formatMonthKey(monthKey);

  // 📊 Load usage for this month
  const { data: usageRow, error: usageError } = await supabaseAdmin
    .from("monthly_usage")
    .select("analyses_used")
    .eq("user_id", userId)
    .eq("month", monthKey)
    .maybeSingle();

  if (usageError && usageError.code !== "PGRST116") {
    console.warn("Error loading usage on dashboard:", usageError);
  }

  const used = usageRow?.analyses_used ?? 0;
  const limit = FREE_ANALYSIS_LIMIT_PER_MONTH;
  const remaining = Math.max(0, limit - used);

  // 📂 Load claims for this user
  const { data: claims, error: claimsError } = await supabaseAdmin
    .from("claims")
    .select("id, issue_type, summary, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (claimsError) {
    console.error("Error loading claims on dashboard:", claimsError);
  }

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
              Your claims dashboard
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full border border-neutral-800 text-neutral-300 hover:bg-neutral-900 transition"
          >
            Back to homepage
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 px-6 md:px-12 lg:px-20 py-8 md:py-10 space-y-6">
        {/* Top row: title + usage */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Your claims
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-xl">
              Every issue you&apos;ve sent to the ResolveForge Refund Engine
              appears here. Click a claim to see the full summary and letter.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            {/* Usage pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-3 py-1 text-[11px] text-neutral-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
              <span>
                This month ({displayMonth}):{" "}
                <strong>
                  {used} / {limit}
                </strong>{" "}
                analyses used (free beta)
              </span>
            </div>
            {remaining === 0 && (
              <p className="text-[11px] text-yellow-300">
                You&apos;ve hit the free tier limit of {limit} analyses for{" "}
                {displayMonth}. More features and higher tiers are coming soon.
              </p>
            )}
          </div>
        </div>

        {/* Claims list */}
        <div className="mt-4">
          {(!claims || claims.length === 0) && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-6 text-sm text-neutral-400">
              You haven&apos;t analysed any issues yet. Go back to the homepage
              to paste your first complaint and generate a letter.
            </div>
          )}

          {claims && claims.length > 0 && (
            <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950/70 overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr,3fr,1fr,1.5fr] gap-4 px-4 py-3 text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                <div>Issue type</div>
                <div>Summary</div>
                <div>Status</div>
                <div>Date</div>
              </div>

              <div className="divide-y divide-neutral-900">
                {claims.map((claim: any) => (
                  <Link
                    key={claim.id}
                    href={`/claim/${claim.id}`}
                    className="block hover:bg-neutral-900/60 transition"
                  >
                    <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-[2fr,3fr,1fr,1.5fr] gap-2 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-neutral-200">
                          {claim.issue_type || "Unknown"}
                        </span>
                      </div>
                      <div className="text-neutral-300 line-clamp-2">
                        {claim.summary || "No summary available."}
                      </div>
                      <div className="text-neutral-400">
                        <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                          {claim.status || "Draft"}
                        </span>
                      </div>
                      <div className="text-neutral-500 text-[11px] md:text-xs">
                        {claim.created_at
                          ? new Date(claim.created_at).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "long", // full month name here too
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
          <a href="/contact" className="hover:text-neutral-300">
  Contact
</a>
        </div>
      </footer>
    </main>
  );
}
