import { db } from "@/lib/db";
import { teamQuestionOverrides } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import type { QuestionOption } from "@/lib/db/schema";

type BaseQuestion = {
  id: string;
  scenarioText: string;
  options: QuestionOption[] | unknown;
  correctOptionId: string;
  explanation: string;
  [key: string]: unknown;
};

/**
 * Fetches team overrides for the given question IDs and merges non-null
 * fields on top of the base questions. Returns the merged array in the
 * same order, plus a `hasOverride` flag on each item.
 */
export async function applyTeamOverrides<T extends BaseQuestion>(
  baseQuestions: T[],
  teamId: string | null | undefined
): Promise<(T & { hasOverride: boolean })[]> {
  if (!teamId || baseQuestions.length === 0) {
    return baseQuestions.map((q) => ({ ...q, hasOverride: false }));
  }

  const questionIds = baseQuestions.map((q) => q.id);

  const overrides = await db
    .select()
    .from(teamQuestionOverrides)
    .where(
      and(
        eq(teamQuestionOverrides.teamId, teamId),
        inArray(teamQuestionOverrides.questionId, questionIds)
      )
    );

  const overrideMap = new Map(overrides.map((o) => [o.questionId, o]));

  return baseQuestions.map((q) => {
    const override = overrideMap.get(q.id);
    if (!override) return { ...q, hasOverride: false };

    return {
      ...q,
      scenarioText: override.scenarioText ?? q.scenarioText,
      options: override.options ?? q.options,
      correctOptionId: override.correctOptionId ?? q.correctOptionId,
      explanation: override.explanation ?? q.explanation,
      hasOverride: true,
    };
  });
}
