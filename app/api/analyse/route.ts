import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'text' field." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
You are an assistant helping UK consumers understand their rights and draft complaint/refund letters.

User complaint:
"""
${text}
"""

1) Briefly identify the type of issue (e.g. "Lost parcel", "Faulty goods", "Landlord repairs", "Subscription cancellation", "Data rights/DSAR", etc).
2) In 3–5 sentences, explain what their likely rights are under UK consumer / tenancy / data law, in plain English.
3) Draft a clear, firm but polite complaint/refund letter they can send. Use generic placeholders like [Retailer], [Landlord], [Order Number], [Date], etc where needed.

Respond ONLY in valid JSON in this exact structure:

{
  "issueType": "short label here",
  "summary": "3-5 sentence summary here",
  "letter": "full letter here"
}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    // The Responses API returns structured output; we pull out the text value
    const content = (completion as any).output?.[0]?.content?.[0];
    const rawText: string =
      content?.text?.value ??
      content?.text ??
      "";

    if (!rawText) {
      console.error("No text content in OpenAI response:", completion);
      return new Response(
        JSON.stringify({
          error: "No content returned from AI.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // In case the model wraps JSON in extra text, extract the JSON block
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    const jsonString =
      firstBrace !== -1 && lastBrace !== -1
        ? rawText.slice(firstBrace, lastBrace + 1)
        : rawText;

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", rawText);
      return new Response(
        JSON.stringify({
          error: "AI returned invalid JSON. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ⭐ Save to Supabase
await supabaseAdmin.from("claims").insert({
  raw_text: text,
  issue_type: parsed.issueType,
  summary: parsed.summary,
  letter: parsed.letter,
  status: "draft"
});

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Analyse API error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to analyse issue. Please try again later.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
