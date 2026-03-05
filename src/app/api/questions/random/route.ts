import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select()
    .from(questions)
    .orderBy(sql`random()`)
    .limit(5);

  return NextResponse.json(rows);
}
