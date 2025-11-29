import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { checkAndIncrementAnalysisUsage } from "@/lib/usage";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<Response> {
  try {
    // 🔐 MUST USE await cookies()
    const cookieStore = await cookies();
    const userId = cookieStore.get("resolveforge_user_id")?.value || null;

    // 🧱 Require login in beta
    if (!userId) {
      return new Response(
        JSON.stringify({
          error:
            "ResolveForge is in beta. Please create a free account and log in to use the AI. Free users get 5 analyses per month.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 🔑 Ensure OpenAI key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY in production environment");
      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 📥 Parse request body
    const body = await request.json().catch(() => null);
    const text = body?.text;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(
        JSON.stringify({
          error:
            "Missing or invalid complaint text. Please enter at least two sentences.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 📊 Usage limit check (free = 5 per month)
    const usage = await checkAndIncrementAnalysisUsage(userId);

    if (!usage.ok) {
      return new Response(
        JSON.stringify({
          error:
            "You’ve reached your free plan limit (5 analyses this month). Higher tiers coming soon.",
          limit: usage.limit,
          used: usage.used,
          month: usage.month,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🧠 AI prompt — JSON ONLY
    const prompt = `
You are ResolveForge, an AI that analyses UK consumer complaints.

You MUST respond with a single JSON object ONLY.
No markdown. No extra text. No commentary.

JSON format:
{
  "issueType": "string",
  "summary": "string",
  "letter": "string"
}

User complaint:
"""
${text}
"""
`.trim();

    // 🧠 Call OpenAI with forced JSON output
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      input: prompt,
    });

    // 🔍 Extract Responses API content
    const first = (completion as any).output?.[0];

    let rawText = "";

    if (first?.type === "output_text" && first?.text?.value) {
      rawText = first.text.value;
    } else if (first?.content?.[0]?.text?.value) {
      rawText = first.content[0].text.value;
    }

    if (!rawText) {
      console.error("❌ No raw text from AI:", completion);
      return new Response(
        JSON.stringify({ error: "No content returned from AI." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔍 rawText SHOULD already be JSON — but we still guard it
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ AI returned invalid JSON:", rawText, err);
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Minimal shape validation
    if (
      typeof parsed.issueType !== "string" ||
      typeof parsed.summary !== "string" ||
      typeof parsed.letter !== "string"
    ) {
      console.error("❌ AI JSON missing required fields:", parsed);
      return new Response(
        JSON.stringify({ error: "AI response was missing data fields." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🗃️ Build Supabase payload
    const claimPayload: any = {
      raw_text: text,
      issue_type: parsed.issueType,
      summary: parsed.summary,
      letter: parsed.letter,
      status: "draft",
    };

    // 🔐 Ensure user exists in Supabase
    const { data: userRow, error: lookupError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (lookupError) console.warn("User lookup error:", lookupError);

    if (userRow?.id) claimPayload.user_id = userId;
    else console.warn("Cookie user not found in users table:", userId);

    // 💾 Insert claim
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("claims")
      .insert(claimPayload)
      .select("id")
      .single();

    if (insertError) {
      console.error("❌ Error inserting claim:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save claim." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Claim inserted:", inserted.id);

    // 🎉 Return AI analysis
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Analyse API fatal error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to analyse issue." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
