import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid email/password." },
        { status: 400 }
      );
    }

    const normalisedEmail = email.trim().toLowerCase();
    const passwordPlain = password.trim();

    if (passwordPlain.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Look up existing user
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id, password_hash")
      .eq("email", normalisedEmail)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error looking up user:", selectError);
      return NextResponse.json(
        { error: "Failed to look up user." },
        { status: 500 }
      );
    }

    let userId: string;

    if (!existing) {
      // No user yet → create one (sign up)
      const hash = await bcrypt.hash(passwordPlain, 10);

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          email: normalisedEmail,
          plan: "free",
          password_hash: hash,
        })
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
    } else {
      // User exists → verify password
      const hash = existing.password_hash as string | null;

      if (!hash) {
        // Legacy user without password_hash → treat as "no password set yet"
        return NextResponse.json(
          { error: "This account has no password set. Please contact support." },
          { status: 403 }
        );
      }

      const match = await bcrypt.compare(passwordPlain, hash);
      if (!match) {
        return NextResponse.json(
          { error: "Incorrect email or password." },
          { status: 401 }
        );
      }

      userId = existing.id as string;
    }

    // Create NextResponse so we can set cookies
    const res = NextResponse.json({ success: true });

    // httpOnly cookie for server-side use
    res.cookies.set("resolveforge_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Non-httpOnly cookie so the UI can switch between "Log in" / "Dashboard"
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
