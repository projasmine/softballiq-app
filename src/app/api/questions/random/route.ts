import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ageGroup = request.nextUrl.searchParams.get("ageGroup");
  const validAgeGroups = ["8U", "10U", "12U", "14U"];
  const filter = ageGroup && validAgeGroups.includes(ageGroup)
    ? sql`${questions.ageGroups} @> ${JSON.stringify([ageGroup])}::jsonb`
    : undefined;

  const rows = await db
    .select()
    .from(questions)
    .where(filter)
    .orderBy(sql`random()`)
    .limit(5);

  return NextResponse.json(rows);
}
