import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'text' field." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // 🔑 Read user id from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("resolveforge_user_id")?.value || null;

    const payload: any = {
      raw_text: text,
      issue_type: parsed.issueType,
      summary: parsed.summary,
      letter: parsed.letter,
      status: "draft",
    };

    // Only attach user_id if that user actually exists
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
