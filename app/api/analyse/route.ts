import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { checkAndIncrementAnalysisUsage } from "@/lib/usage";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<Response> {
  try {
    // 🔐 Get user id from cookie (using await cookies())
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
      console.error("❌ Missing OPENAI_API_KEY in environment variables");
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

    // 🧠 System + user messages – JSON ONLY
    const systemPrompt = `
You are ResolveForge, an AI that analyses UK consumer complaints under UK consumer law.

You MUST always respond in valid JSON format only.
No markdown. No extra text. No commentary. Just a single JSON object.

JSON format:
{
  "issueType": "short label for the issue, e.g. 'Late delivery & faulty item'",
  "summary": "3–5 sentences explaining the customer's rights in clear UK consumer law terms.",
  "letter": "A full complaint/refund letter they can send, with proper greeting, structure and closing."
}
`.trim();

    const userPrompt = `
Analyse the following complaint and respond ONLY with a single JSON object in the exact format described.

Complaint:
"""
${text}
"""
`.trim();

    // 🧠 Call Chat Completions API with JSON mode
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    if (!rawText || typeof rawText !== "string") {
      console.error("❌ No usable text returned from AI:", completion);
      return new Response(
        JSON.stringify({ error: "No content returned from AI." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔍 rawText SHOULD already be pure JSON – but we still guard it
    let parsed: {
      issueType: string;
      summary: string;
      letter: string;
      [key: string]: any;
    };

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
        JSON.stringify({ error: "AI response was missing required fields." }),
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

    if (lookupError) {
      console.warn("User lookup error in analyse route:", lookupError);
    }

    if (userRow?.id) {
      claimPayload.user_id = userId;
    } else {
      console.warn(
        "Cookie user not found in users table, saving claim without user_id:",
        userId
      );
    }

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

    // 🎉 Return AI analysis back to frontend
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
