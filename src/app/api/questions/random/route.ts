import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import type { QuestionOption } from "@/lib/db/schema";
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

  // Shuffle option order so correct answer position is unpredictable
  const shuffled = rows.map((q) => {
    const options = [...(q.options as QuestionOption[])];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...q, options };
  });

  return NextResponse.json(shuffled);
}
