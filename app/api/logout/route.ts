import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear auth cookies
  res.cookies.set("resolveforge_user_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("resolveforge_email", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}
