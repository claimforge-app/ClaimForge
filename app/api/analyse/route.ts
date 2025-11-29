import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { checkAndIncrementAnalysisUsage } from "@/lib/usage";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 🔐 Read user id from cookie using await cookies()
    const cookieStore = await cookies();
    const userId = cookieStore.get("resolveforge_user_id")?.value || null;

    // ✅ Beta: require login so we can track monthly usage
    if (!userId) {
      return new Response(
        JSON.stringify({
          error:
            "ResolveForge is in beta. Please create a free account and log in to use the AI. Free users get 5 analyses per month. More features and higher tiers are being developed and will be available soon.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 📥 Parse request body
    const { text } = await request.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(
        JSON.stringify({
          error:
            "Missing or invalid 'text' field. Please provide a meaningful complaint (at least a few sentences).",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 📊 Check & increment monthly usage (5 analyses/month on free tier)
    const usage = await checkAndIncrementAnalysisUsage(userId);

    if (!usage.ok) {
      return new Response(
        JSON.stringify({
          error:
            "You’ve reached the free plan limit for this month. ResolveForge Beta allows 5 AI analyses per month on the free tier. More features and higher tiers are coming very soon.",
          limit: usage.limit,
          used: usage.used,
          month: usage.month,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 🧠 AI prompt
    const prompt = `
You are an assistant helping UK consumers understand their rights and draft complaint/refund letters.

User complaint:
"""
${text}
"""

1) Identify the issue type.
2) Summarise their rights in 3–5 sentences.
3) Draft a complaint/refund letter.

Respond ONLY in:
{
  "issueType": "...",
  "summary": "...",
  "letter": "..."
}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const content = (completion as any).output?.[0]?.content?.[0];
    const rawText: string = content?.text?.value ?? content?.text ?? "";
    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "No content returned from AI." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 🧹 Extract JSON from model output
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    const jsonString =
      firstBrace !== -1 && lastBrace !== -1
        ? rawText.slice(firstBrace, lastBrace + 1)
        : rawText;

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 🗃️ Build payload to insert into claims table
    const payload: any = {
      raw_text: text,
      issue_type: parsed.issueType,
      summary: parsed.summary,
      letter: parsed.letter,
      status: "draft",
    };

    // 🔐 Only attach user_id if that user actually exists
    if (userId) {
      const { data: userRow, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.warn("Error looking up user in analyse route:", userError);
      }

      if (userRow?.id) {
        payload.user_id = userId;
      } else {
        console.warn(
          "User id from cookie not found in users table, saving claim without user_id:",
          userId
        );
      }
    }

    console.log("Analyse route – inserting claim with payload:", payload);

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("claims")
      .insert(payload)
      .select("id");

    if (insertError) {
      console.error("Error inserting claim:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save claim." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Claim inserted with id:", insertData?.[0]?.id);

    // ✅ Return the parsed AI result to the frontend
    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Analyse API error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to analyse issue." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
