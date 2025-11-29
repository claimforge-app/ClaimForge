import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid email." },
        { status: 400 }
      );
    }

    const normalisedEmail = email.trim().toLowerCase();

    // Look up existing user
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalisedEmail)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error looking up user:", selectError);
      return NextResponse.json(
        { error: "Failed to look up user." },
        { status: 500 }
      );
    }

    let userId = existing?.id as string | undefined;

    // If not found, create user
    if (!userId) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({ email: normalisedEmail, plan: "free" })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("Error creating user:", insertError);
        return NextResponse.json(
          { error: "Failed to create user." },
          { status: 500 }
        );
      }

      userId = inserted.id;
    }

    // Create NextResponse so we can set cookies
    const res = NextResponse.json({ success: true });

    // httpOnly cookie for server-side use
    res.cookies.set("resolveforge_user_id", userId!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Optional non-httpOnly cookie so you can show the email in the UI later
    res.cookies.set("resolveforge_email", normalisedEmail, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return res;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
