import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const FREE_ANALYSIS_LIMIT_PER_MONTH = 5;

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("resolveforge_user_id")?.value || null;

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Not logged in.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const monthKey = getCurrentMonthKey();

    // Optional: read the user's plan
    const { data: userRow, error: userError } = await supabaseAdmin
      .from("users")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.warn("Error reading user plan in /api/usage:", userError);
    }

    const plan = userRow?.plan || "free";
    const isFreePlan = plan === "free";

    // For now, only free plan has limits, but we keep structure future-proof
    const limit = isFreePlan ? FREE_ANALYSIS_LIMIT_PER_MONTH : 999999;

    const { data: usageRow, error: usageError } = await supabaseAdmin
      .from("monthly_usage")
      .select("analyses_used")
      .eq("user_id", userId)
      .eq("month", monthKey)
      .maybeSingle();

    if (usageError && usageError.code !== "PGRST116") {
      console.warn("Error reading monthly_usage in /api/usage:", usageError);
    }

    const used = usageRow?.analyses_used ?? 0;
    const remaining = Math.max(0, limit - used);

    return new Response(
      JSON.stringify({
        used,
        limit: isFreePlan ? FREE_ANALYSIS_LIMIT_PER_MONTH : limit,
        remaining: isFreePlan ? remaining : null,
        month: monthKey,
        plan,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Usage API error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to load usage.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
