import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Please provide an email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "That doesn’t look like a valid email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Try to insert. If the email already exists, we just treat it as success.
    const { error: insertError } = await supabaseAdmin
      .from("early_access_signups")
      .insert({
        email: trimmedEmail,
        source: "hero_button",
      });

    if (insertError) {
      // Unique violation or other error
      if (insertError.code === "23505") {
        // 23505 = unique_violation (email already exists)
        return new Response(
          JSON.stringify({
            success: true,
            message:
              "You’re already on the ResolveForge early access list. We’ll email you when new features go live.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.error("Error inserting early access signup:", insertError);
      return new Response(
        JSON.stringify({
          error:
            "We couldn’t save your email right now. Please try again in a moment.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "You’re on the ResolveForge early access list. We’ll email you when new features and tiers go live.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Early access API error:", err);
    return new Response(
      JSON.stringify({
        error: "Unexpected error. Please try again shortly.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
