import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { password, displayName, role } = body;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !password || !displayName) {
    return NextResponse.json(
      { error: "Email, password, and name are required" },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (typeof displayName !== "string" || displayName.trim().length === 0 || displayName.length > 100) {
    return NextResponse.json(
      { error: "Name must be between 1 and 100 characters" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.insert(profiles).values({
      email,
      passwordHash,
      displayName: displayName.trim(),
      role: role === "coach" ? "coach" : "player",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
