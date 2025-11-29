import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  // In your Next version, cookies() is async → await it
  const cookieStore = await cookies();
  const userId = cookieStore.get("resolveforge_user_id")?.value || null;

  // If not logged in, show message + link to login
  if (!userId) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col">
        {/* Top bar (same style as home, but simple right side) */}
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
            <a
              href="/login"
              className="inline-flex px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 hover:bg-neutral-900 transition"
            >
              Log in
            </a>
          </div>
        </header>

        <section className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-semibold text-yellow-400 mb-3">
              Your Claims
            </h1>
            <p className="text-sm text-neutral-300 mb-4">
              You need to sign in to view your claims history.
            </p>
            <a
              href="/login"
              className="inline-flex px-4 py-2.5 rounded-full bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition"
            >
              Go to login
            </a>
          </div>
        </section>
      </main>
    );
  }

  // Logged in → load only this user's claims
  const { data: claims, error } = await supabaseAdmin
    .from("claims")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading claims:", error);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar – same style as home, but with Home + Log out */}
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
          <a
            href="/"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 hover:bg-neutral-900 transition"
          >
            Home
          </a>
          <LogoutButton variant="light" />
        </div>
      </header>

      {/* Claims list */}
      <section className="flex-1 px-6 md:px-16 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold text-yellow-400 mb-4">
            Your claims
          </h1>

          {(!claims || claims.length === 0) && (
            <p className="text-center text-sm text-neutral-400">
              You haven&apos;t submitted any claims yet.
            </p>
          )}

          <div className="space-y-3">
            {claims?.map((claim: any) => (
              <a
                key={claim.id}
                href={`/claim/${claim.id}`}
                className="block no-underline text-inherit"
              >
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 hover:border-yellow-400/70 transition-all">
                  <h2 className="text-sm font-semibold text-yellow-400 mb-1">
                    {claim.issue_type || "Unknown Issue"}
                  </h2>
                  <p className="text-xs text-neutral-300 mb-1">
                    {claim.summary?.slice(0, 140) || "No summary"}...
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {claim.created_at
                      ? new Date(claim.created_at).toLocaleString()
                      : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer to match home (optional) */}
      <footer className="border-t border-neutral-800 px-6 py-4 text-[11px] text-neutral-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} ResolveForge. All rights reserved.</div>
        <div className="flex gap-4">
          <button className="hover:text-neutral-300">Privacy</button>
          <button className="hover:text-neutral-300">Terms</button>
          <button className="hover:text-neutral-300">Contact</button>
        </div>
      </footer>
    </main>
  );
}
