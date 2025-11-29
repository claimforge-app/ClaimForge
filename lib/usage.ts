// lib/usage.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
);

const FREE_ANALYSIS_LIMIT_PER_MONTH = 5;

/**
 * Returns a string like "2025-11" for the current month (UTC).
 */
function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export type UsageCheckResult = {
  ok: boolean;
  used: number;
  remaining: number;
  limit: number;
  month: string;
};

/**
 * Check and increment the monthly usage for AI analyses.
 * If the user is on the free plan and has hit the limit, returns ok: false.
 */
export async function checkAndIncrementAnalysisUsage(
  userId: string
): Promise<UsageCheckResult> {
  const monthKey = getCurrentMonthKey();

  // 1) Look up the user's plan from the users table
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error loading user plan:", userError);
    // Fail safely: treat as free user
  }

  const plan = user?.plan || "free";
  const isFreePlan = plan === "free";

  // If this is NOT a free plan, we don't enforce limits here (for future paid tiers)
  if (!isFreePlan) {
    return {
      ok: true,
      used: 0,
      remaining: Number.POSITIVE_INFINITY,
      limit: Number.POSITIVE_INFINITY,
      month: monthKey,
    };
  }

  // 2) Look for an existing monthly_usage row for this user + month
  const { data: usageRow, error: usageError } = await supabase
    .from("monthly_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("month", monthKey)
    .maybeSingle();

  if (usageError && usageError.code !== "PGRST116") {
    // PGRST116 = no rows
    console.error("Error loading monthly_usage:", usageError);
  }

  let currentUsed = usageRow?.analyses_used ?? 0;

  // 3) If at or over limit, block
  if (currentUsed >= FREE_ANALYSIS_LIMIT_PER_MONTH) {
    return {
      ok: false,
      used: currentUsed,
      remaining: 0,
      limit: FREE_ANALYSIS_LIMIT_PER_MONTH,
      month: monthKey,
    };
  }

  // 4) Increment usage in the database
  currentUsed += 1;

  if (!usageRow) {
    // Create new row
    const { error: insertError } = await supabase.from("monthly_usage").insert({
      user_id: userId,
      month: monthKey,
      analyses_used: currentUsed,
    });

    if (insertError) {
      console.error("Error inserting monthly_usage:", insertError);
    }
  } else {
    // Update existing row
    const { error: updateError } = await supabase
      .from("monthly_usage")
      .update({ analyses_used: currentUsed })
      .eq("id", usageRow.id);

    if (updateError) {
      console.error("Error updating monthly_usage:", updateError);
    }
  }

  const remaining = Math.max(
    0,
    FREE_ANALYSIS_LIMIT_PER_MONTH - currentUsed
  );

  return {
    ok: true,
    used: currentUsed,
    remaining,
    limit: FREE_ANALYSIS_LIMIT_PER_MONTH,
    month: monthKey,
  };
}
