"use server";

import { db } from "@/lib/db";
import {
  profiles,
  teams,
  teamMembers,
  questions,
  quizAttempts,
  quizAnswers,
  dailyStreaks,
  assignments,
  assignmentQuestions,
  assignmentCompletions,
  videoAssignments,
  videoComments,
  teamQuestionOverrides,
  passwordResetTokens,
} from "@/lib/db/schema";
import type { QuestionOption } from "@/lib/db/schema";
import { eq, and, desc, sql, inArray, lt } from "drizzle-orm";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { applyTeamOverrides } from "@/lib/questions";
import { auth, signOut as nextAuthSignOut } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

// Safe profile columns — excludes passwordHash
const safeProfileColumns = {
  id: profiles.id,
  email: profiles.email,
  displayName: profiles.displayName,
  role: profiles.role,
  positions: profiles.positions,
  avatarUrl: profiles.avatarUrl,
  plan: profiles.plan,
  createdAt: profiles.createdAt,
  updatedAt: profiles.updatedAt,
};

// ─── Auth Actions ──────────────────────────────────────
export async function updatePositions(positions: string[]) {
  const userId = await requireUserId();

  await db
    .update(profiles)
    .set({ positions, updatedAt: new Date() })
    .where(eq(profiles.id, userId));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfile(data: {
  displayName?: string;
  email?: string;
}) {
  const userId = await requireUserId();

  const updates: { displayName?: string; email?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (data.displayName?.trim()) {
    updates.displayName = data.displayName.trim();
  }

  if (data.email?.trim()) {
    const email = data.email.trim().toLowerCase();
    // Check if email is already taken by another user
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(eq(profiles.email, email)))
      .limit(1);
    if (existing && existing.id !== userId) {
      return { success: false, error: "Email already in use" };
    }
    updates.email = email;
  }

  await db.update(profiles).set(updates).where(eq(profiles.id, userId));

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function signOut() {
  await nextAuthSignOut({ redirect: false });
  redirect("/login");
}

// ─── Team Actions ──────────────────────────────────────
export async function createTeam(name: string, ageGroup?: string) {
  const userId = await requireUserId();

  const joinCode = generateJoinCode();
  const validAgeGroups = ["8U", "10U", "12U", "14U"] as const;
  const age = validAgeGroups.includes(ageGroup as typeof validAgeGroups[number])
    ? (ageGroup as typeof validAgeGroups[number])
    : "12U";
  const [team] = await db
    .insert(teams)
    .values({ name, joinCode, createdBy: userId, ageGroup: age })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: "coach",
  });

  revalidatePath("/dashboard");
  return { success: true, joinCode: team.joinCode, teamId: team.id };
}

export async function joinTeam(joinCode: string) {
  const userId = await requireUserId();

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.joinCode, joinCode.toUpperCase()))
    .limit(1);

  if (!team) return { success: false, error: "Team not found" };

  // Check if already a member
  const [existing] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId))
    )
    .limit(1);

  if (existing) return { success: false, error: "Already on this team" };

  // Determine role based on user's profile role
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  const memberRole = profile?.role === "coach" ? "coach" : "player";

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: memberRole,
  });

  // Create streak record
  await db
    .insert(dailyStreaks)
    .values({ userId, teamId: team.id })
    .onConflictDoNothing();

  revalidatePath("/dashboard");
  return { success: true, teamName: team.name };
}

// ─── Quiz Actions ──────────────────────────────────────
export async function startDailyRep() {
  const userId = await requireUserId();

  const [profile] = await db
    .select(safeProfileColumns)
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  // Get user's team
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  // Get recently answered question IDs to avoid repeats
  const recentAttempts = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(
      and(eq(quizAttempts.userId, userId), eq(quizAttempts.type, "daily_rep"))
    )
    .orderBy(desc(quizAttempts.createdAt))
    .limit(3);

  let recentQuestionIds: string[] = [];
  if (recentAttempts.length > 0) {
    const recentAnswers = await db
      .select({ questionId: quizAnswers.questionId })
      .from(quizAnswers)
      .where(
        inArray(
          quizAnswers.attemptId,
          recentAttempts.map((a) => a.id)
        )
      );
    recentQuestionIds = recentAnswers.map((a) => a.questionId);
  }

  // Get team age group for filtering
  let teamAgeGroup: string | null = null;
  if (membership?.teamId) {
    const [team] = await db
      .select({ ageGroup: teams.ageGroup })
      .from(teams)
      .where(eq(teams.id, membership.teamId))
      .limit(1);
    teamAgeGroup = team?.ageGroup ?? null;
  }

  // Get 5 questions, preferring position-relevant ones, filtered by age group
  const ageFilter = teamAgeGroup
    ? sql`${questions.ageGroups} @> ${JSON.stringify([teamAgeGroup])}::jsonb`
    : undefined;
  let questionPool = await db
    .select()
    .from(questions)
    .where(ageFilter)
    .orderBy(sql`RANDOM()`)
    .limit(20);

  // Filter out recent questions
  if (recentQuestionIds.length > 0) {
    questionPool = questionPool.filter(
      (q) => !recentQuestionIds.includes(q.id)
    );
  }

  // Prefer position-relevant questions
  const positions = (profile?.positions as string[]) || [];
  const positionQuestions = questionPool.filter(
    (q) =>
      !q.positions ||
      (q.positions as string[]).length === 0 ||
      (q.positions as string[]).some((p) => positions.includes(p))
  );

  const selectedQuestions = (
    positionQuestions.length >= 5 ? positionQuestions : questionPool
  ).slice(0, 5);

  if (selectedQuestions.length === 0) {
    return { success: false, error: "No questions available" };
  }

  // Apply team overrides
  const mergedQuestions = await applyTeamOverrides(
    selectedQuestions,
    membership?.teamId
  );

  // Create quiz attempt
  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId,
      teamId: membership?.teamId ?? null,
      type: "daily_rep",
      totalQuestions: mergedQuestions.length,
    })
    .returning();

  return {
    success: true,
    attemptId: attempt.id,
    questions: mergedQuestions,
  };
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
  responseTimeMs?: number
) {
  const userId = await requireUserId();

  // Verify the attempt belongs to this user
  const [attempt] = await db
    .select({ userId: quizAttempts.userId, teamId: quizAttempts.teamId })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)))
    .limit(1);
  if (!attempt) throw new Error("Attempt not found");

  // Compute correctness server-side
  const [question] = await db
    .select({ correctOptionId: questions.correctOptionId, options: questions.options })
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);
  if (!question) throw new Error("Question not found");

  // Check for team override on correctOptionId and options
  let effectiveCorrectId = question.correctOptionId;
  let effectiveOptions = question.options as { id: string }[];
  if (attempt.teamId) {
    const [override] = await db
      .select({
        correctOptionId: teamQuestionOverrides.correctOptionId,
        options: teamQuestionOverrides.options,
      })
      .from(teamQuestionOverrides)
      .where(
        and(
          eq(teamQuestionOverrides.teamId, attempt.teamId),
          eq(teamQuestionOverrides.questionId, questionId)
        )
      )
      .limit(1);
    if (override?.correctOptionId) effectiveCorrectId = override.correctOptionId;
    if (override?.options) effectiveOptions = override.options as { id: string }[];
  }

  // Validate that selectedOptionId is a real option
  if (!effectiveOptions.some((o) => o.id === selectedOptionId)) {
    throw new Error("Invalid option");
  }

  const isCorrect = selectedOptionId === effectiveCorrectId;

  await db.insert(quizAnswers).values({
    attemptId,
    questionId,
    selectedOptionId,
    isCorrect,
    responseTimeMs: responseTimeMs ?? null,
  });

  return { isCorrect };
}

export async function completeQuiz(attemptId: string) {
  const userId = await requireUserId();

  // Verify ownership
  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)))
    .limit(1);
  if (!attempt) throw new Error("Attempt not found");

  // Calculate score
  const answers = await db
    .select()
    .from(quizAnswers)
    .where(eq(quizAnswers.attemptId, attemptId));

  const score = answers.filter((a) => a.isCorrect).length;

  // Update attempt
  await db
    .update(quizAttempts)
    .set({ score, completedAt: new Date() })
    .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)));

  // Update streak if daily rep
  if (attempt?.type === "daily_rep") {
    await updateStreak(userId, attempt.teamId);
  }

  revalidatePath("/dashboard");
  return { score, total: answers.length };
}

async function updateStreak(userId: string, teamId: string | null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [streak] = await db
    .select()
    .from(dailyStreaks)
    .where(
      teamId
        ? and(
            eq(dailyStreaks.userId, userId),
            eq(dailyStreaks.teamId, teamId)
          )
        : eq(dailyStreaks.userId, userId)
    )
    .limit(1);

  if (!streak) {
    await db.insert(dailyStreaks).values({
      userId,
      teamId,
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: today,
    });
    return;
  }

  const lastDate = streak.lastCompletedDate
    ? new Date(streak.lastCompletedDate)
    : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  // Already completed today
  if (lastDate && lastDate.getTime() === today.getTime()) return;

  let newStreak = 1;
  if (lastDate && lastDate.getTime() === yesterday.getTime()) {
    newStreak = streak.currentStreak + 1;
  }

  const newLongest = Math.max(newStreak, streak.longestStreak);

  await db
    .update(dailyStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: today,
    })
    .where(eq(dailyStreaks.id, streak.id));
}

// ─── Assignment Actions ────────────────────────────────
export async function createAssignment(data: {
  title: string;
  teamId: string;
  categoryFilter?: string;
  difficultyFilter?: string;
  questionCount: number;
  timeLimitSeconds?: number;
  dueDate?: string;
  questionIds?: string[];
}) {
  const userId = await requireUserId();

  // Verify the user is a coach on this team
  const [coachMembership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, data.teamId),
        eq(teamMembers.role, "coach")
      )
    )
    .limit(1);
  if (!coachMembership) throw new Error("Not authorized");

  const [assignment] = await db
    .insert(assignments)
    .values({
      teamId: data.teamId,
      createdBy: userId,
      title: data.title,
      categoryFilter: data.categoryFilter as
        | "baserunning"
        | "fielding"
        | "hitting"
        | "general"
        | undefined,
      difficultyFilter: data.difficultyFilter as
        | "beginner"
        | "intermediate"
        | "advanced"
        | undefined,
      questionCount: data.questionCount,
      timeLimitSeconds: data.timeLimitSeconds ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    })
    .returning();

  // If specific questions provided, use them. Otherwise pick random ones.
  let questionIds = data.questionIds || [];
  if (questionIds.length === 0) {
    const filters = [];
    if (data.categoryFilter) {
      filters.push(eq(questions.category, data.categoryFilter as "baserunning" | "fielding" | "hitting" | "general"));
    }
    if (data.difficultyFilter) {
      filters.push(eq(questions.difficulty, data.difficultyFilter as "beginner" | "intermediate" | "advanced"));
    }
    const pool = await db
      .select({ id: questions.id })
      .from(questions)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(data.questionCount);
    questionIds = pool.map((q) => q.id);
  }

  if (questionIds.length > 0) {
    await db.insert(assignmentQuestions).values(
      questionIds.map((qId, i) => ({
        assignmentId: assignment.id,
        questionId: qId,
        orderIndex: i,
      }))
    );
  }

  revalidatePath("/assignments");
  return { success: true, assignmentId: assignment.id };
}

export async function startAssignment(assignmentId: string) {
  const userId = await requireUserId();

  // Get the assignment and verify team membership
  const [assignment] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!assignment) return { success: false, error: "Assignment not found" };

  // Verify user belongs to the assignment's team
  const [membership] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, assignment.teamId),
        eq(teamMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership) return { success: false, error: "Not a member of this team" };

  // Get assignment questions
  const aq = await db
    .select({ questionId: assignmentQuestions.questionId })
    .from(assignmentQuestions)
    .where(eq(assignmentQuestions.assignmentId, assignmentId))
    .orderBy(assignmentQuestions.orderIndex);

  if (aq.length === 0) return { success: false, error: "No questions found" };

  const questionList = await db
    .select()
    .from(questions)
    .where(
      inArray(
        questions.id,
        aq.map((a) => a.questionId)
      )
    );

  // Apply team overrides
  const mergedQuestions = await applyTeamOverrides(questionList, assignment.teamId);

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId,
      teamId: assignment.teamId,
      type: "assignment",
      totalQuestions: mergedQuestions.length,
    })
    .returning();

  return {
    success: true,
    attemptId: attempt.id,
    questions: mergedQuestions,
    assignmentId,
    timeLimitSeconds: assignment.timeLimitSeconds,
  };
}

export async function completeAssignment(
  assignmentId: string,
  attemptId: string
) {
  const userId = await requireUserId();

  // Verify attempt ownership
  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)))
    .limit(1);
  if (!attempt) throw new Error("Attempt not found");

  // Check for duplicate completion
  const [existingCompletion] = await db
    .select({ id: assignmentCompletions.id })
    .from(assignmentCompletions)
    .where(
      and(
        eq(assignmentCompletions.assignmentId, assignmentId),
        eq(assignmentCompletions.userId, userId)
      )
    )
    .limit(1);
  if (existingCompletion) {
    return { score: attempt.score ?? 0, total: attempt.totalQuestions };
  }

  const answers = await db
    .select()
    .from(quizAnswers)
    .where(eq(quizAnswers.attemptId, attemptId));
  const score = answers.filter((a) => a.isCorrect).length;

  await db
    .update(quizAttempts)
    .set({ score, completedAt: new Date() })
    .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)));

  await db.insert(assignmentCompletions).values({
    assignmentId,
    userId,
    attemptId,
    score,
  });

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { score, total: answers.length };
}

// ─── Data Fetching ─────────────────────────────────────
export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [profile] = await db
    .select(safeProfileColumns)
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) return null;

  // Get team membership
  const [membership] = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamName: teams.name,
      joinCode: teams.joinCode,
      ageGroup: teams.ageGroup,
      theme: teams.theme,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  // Get streak
  const [streak] = await db
    .select()
    .from(dailyStreaks)
    .where(eq(dailyStreaks.userId, userId))
    .limit(1);

  // Check if daily rep completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyRepCompleted =
    streak?.lastCompletedDate &&
    new Date(streak.lastCompletedDate).setHours(0, 0, 0, 0) ===
      today.getTime();

  // Recent attempts
  const recentAttempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.createdAt))
    .limit(5);

  // Pending assignments (for players)
  type AssignmentRow = typeof assignments.$inferSelect;
  let pendingAssignments: AssignmentRow[] = [];
  if (profile.role === "player" && membership) {
    const teamAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.teamId, membership.teamId));

    const completedIds = (
      await db
        .select({ assignmentId: assignmentCompletions.assignmentId })
        .from(assignmentCompletions)
        .where(eq(assignmentCompletions.userId, userId))
    ).map((c) => c.assignmentId);

    pendingAssignments = teamAssignments.filter(
      (a) => !completedIds.includes(a.id)
    );
  }

  // Recent assignments (for coaches)
  let recentAssignments: AssignmentRow[] = [];
  if (profile.role === "coach" && membership) {
    recentAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.teamId, membership.teamId))
      .orderBy(desc(assignments.createdAt))
      .limit(5);
  }

  return {
    profile,
    membership,
    streak,
    dailyRepCompleted: !!dailyRepCompleted,
    recentAttempts,
    pendingAssignments,
    recentAssignments,
  };
}

export async function getLeaderboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (!membership) return { players: [], teamName: "" };

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, membership.teamId))
    .limit(1);

  // Get all team members
  const members = await db
    .select({
      userId: teamMembers.userId,
      displayName: profiles.displayName,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(profiles, eq(profiles.id, teamMembers.userId))
    .where(
      and(
        eq(teamMembers.teamId, membership.teamId),
        eq(teamMembers.role, "player")
      )
    );

  // Get scores for each member
  const playerScores = await Promise.all(
    members.map(async (member) => {
      const attempts = await db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.userId, member.userId),
            eq(quizAttempts.teamId, membership.teamId)
          )
        );

      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalQuestions = attempts.reduce(
        (sum, a) => sum + a.totalQuestions,
        0
      );

      const [streak] = await db
        .select()
        .from(dailyStreaks)
        .where(eq(dailyStreaks.userId, member.userId))
        .limit(1);

      // Average response time for correct answers
      const responseTimes = await db
        .select({ responseTimeMs: quizAnswers.responseTimeMs })
        .from(quizAnswers)
        .innerJoin(quizAttempts, eq(quizAttempts.id, quizAnswers.attemptId))
        .where(
          and(
            eq(quizAttempts.userId, member.userId),
            eq(quizAnswers.isCorrect, true),
            sql`${quizAnswers.responseTimeMs} IS NOT NULL`
          )
        );

      const validTimes = responseTimes
        .map((r) => r.responseTimeMs)
        .filter((t): t is number => t !== null);
      const avgResponseTimeMs =
        validTimes.length > 0
          ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
          : null;

      return {
        userId: member.userId,
        displayName: member.displayName,
        totalScore,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
        currentStreak: streak?.currentStreak ?? 0,
        avgResponseTimeMs,
      };
    })
  );

  playerScores.sort((a, b) => b.totalScore - a.totalScore);

  return { players: playerScores, teamName: team?.name ?? "" };
}

export async function getTeamRoster() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.userId, userId), eq(teamMembers.role, "coach"))
    )
    .limit(1);

  if (!membership) return null;

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, membership.teamId))
    .limit(1);

  const members = await db
    .select({
      userId: teamMembers.userId,
      displayName: profiles.displayName,
      role: teamMembers.role,
      positions: profiles.positions,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(profiles, eq(profiles.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, membership.teamId));

  // Get stats per player
  const playerStats = await Promise.all(
    members.map(async (member) => {
      const attempts = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, member.userId));

      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalQuestions = attempts.reduce(
        (sum, a) => sum + a.totalQuestions,
        0
      );

      const [streak] = await db
        .select()
        .from(dailyStreaks)
        .where(eq(dailyStreaks.userId, member.userId))
        .limit(1);

      return {
        ...member,
        totalScore,
        totalQuestions,
        accuracy:
          totalQuestions > 0
            ? Math.round((totalScore / totalQuestions) * 100)
            : 0,
        currentStreak: streak?.currentStreak ?? 0,
        quizCount: attempts.length,
      };
    })
  );

  return { team, members: playerStats };
}

export async function getPlayerProgress(playerId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const targetId = playerId || session.user.id;

  // If viewing another player, verify caller is a coach on the same team
  if (playerId && playerId !== session.user.id) {
    const [coachMembership] = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(and(eq(teamMembers.userId, session.user.id), eq(teamMembers.role, "coach")))
      .limit(1);
    if (!coachMembership) return null;
    const [playerMembership] = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(and(eq(teamMembers.userId, playerId), eq(teamMembers.teamId, coachMembership.teamId)))
      .limit(1);
    if (!playerMembership) return null;
  }

  // Get answers grouped by category
  const answersWithQuestions = await db
    .select({
      category: questions.category,
      isCorrect: quizAnswers.isCorrect,
    })
    .from(quizAnswers)
    .innerJoin(questions, eq(questions.id, quizAnswers.questionId))
    .innerJoin(
      quizAttempts,
      eq(quizAttempts.id, quizAnswers.attemptId)
    )
    .where(eq(quizAttempts.userId, targetId));

  const categories = ["baserunning", "fielding", "hitting", "general"];
  const categoryStats = categories.map((cat) => {
    const catAnswers = answersWithQuestions.filter((a) => a.category === cat);
    const correct = catAnswers.filter((a) => a.isCorrect).length;
    const total = catAnswers.length;
    return {
      category: cat,
      correct,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  // Get recent accuracy trend (last 10 attempts)
  const recentAttempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, targetId))
    .orderBy(desc(quizAttempts.createdAt))
    .limit(10);

  const trend = recentAttempts
    .filter((a) => a.score !== null)
    .reverse()
    .map((a) => ({
      date: a.createdAt.toLocaleDateString(),
      accuracy: Math.round(((a.score || 0) / a.totalQuestions) * 100),
    }));

  return { categoryStats, trend };
}

export async function getQuestionBank() {
  const userId = await requireUserId();

  // Only coaches can view the full question bank
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (profile?.role !== "coach") return { questions: [], teamId: null };

  // Get coach's team
  const [membership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.role, "coach")))
    .limit(1);

  const allQuestions = await db.select().from(questions).orderBy(questions.category);
  const merged = await applyTeamOverrides(allQuestions, membership?.teamId);

  return { questions: merged, teamId: membership?.teamId ?? null };
}

export async function getTeamAssignments() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [profile] = await db
    .select(safeProfileColumns)
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (!membership) return { assignments: [], completions: [] };

  const teamAssignments = await db
    .select()
    .from(assignments)
    .where(eq(assignments.teamId, membership.teamId))
    .orderBy(desc(assignments.createdAt));

  const completions = await db
    .select()
    .from(assignmentCompletions)
    .where(eq(assignmentCompletions.userId, userId));

  // For coaches, get all completions
  let allCompletions: typeof completions = [];
  if (profile?.role === "coach" && teamAssignments.length > 0) {
    allCompletions = await db
      .select()
      .from(assignmentCompletions)
      .where(
        inArray(
          assignmentCompletions.assignmentId,
          teamAssignments.map((a) => a.id)
        )
      );
  }

  return {
    assignments: teamAssignments,
    completions: profile?.role === "coach" ? allCompletions : completions,
    role: profile?.role,
    teamId: membership.teamId,
  };
}

export async function getAttemptResults(attemptId: string) {
  const userId = await requireUserId();

  // Verify the attempt belongs to the user
  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)))
    .limit(1);
  if (!attempt) return { answers: [], attempt: null };

  const answers = await db
    .select({
      questionId: quizAnswers.questionId,
      selectedOptionId: quizAnswers.selectedOptionId,
      isCorrect: quizAnswers.isCorrect,
      scenarioText: questions.scenarioText,
      options: questions.options,
      correctOptionId: questions.correctOptionId,
      explanation: questions.explanation,
    })
    .from(quizAnswers)
    .innerJoin(questions, eq(questions.id, quizAnswers.questionId))
    .where(eq(quizAnswers.attemptId, attemptId));

  // Apply team overrides so results show what the player actually saw
  if (attempt.teamId) {
    const answersWithId = answers.map((a) => ({ ...a, id: a.questionId }));
    const merged = await applyTeamOverrides(answersWithId, attempt.teamId);
    return {
      answers: merged.map(({ id, hasOverride, ...rest }) => rest),
      attempt,
    };
  }

  return { answers, attempt };
}

export async function deleteTeam(teamId: string) {
  const userId = await requireUserId();

  // Verify the user is the coach/creator of this team
  const [coachMembership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, "coach")
      )
    )
    .limit(1);
  if (!coachMembership) throw new Error("Not authorized");

  // Delete the team — cascades will clean up team_members, assignments, video_assignments, etc.
  await db.delete(teams).where(eq(teams.id, teamId));

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

export async function addPlayerToRoster(playerName: string) {
  const userId = await requireUserId();

  if (!playerName.trim()) throw new Error("Player name is required");

  // Verify the user is a coach on a team
  const [coachMembership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(
      and(eq(teamMembers.userId, userId), eq(teamMembers.role, "coach"))
    )
    .limit(1);
  if (!coachMembership) throw new Error("Not authorized");

  // Create a guest profile for the player (no password, no real email)
  const guestEmail = `player_${crypto.randomUUID()}@fastpitch.local`;
  const [profile] = await db
    .insert(profiles)
    .values({
      email: guestEmail,
      displayName: playerName.trim(),
      role: "player",
      passwordHash: null,
    })
    .returning({ id: profiles.id });

  // Add to team
  await db.insert(teamMembers).values({
    teamId: coachMembership.teamId,
    userId: profile.id,
    role: "player",
  });

  // Initialize streak
  await db.insert(dailyStreaks).values({
    userId: profile.id,
    teamId: coachMembership.teamId,
    currentStreak: 0,
    longestStreak: 0,
  });

  revalidatePath("/team");
  return { success: true };
}

export async function getTeamByCode(joinCode: string) {
  if (!joinCode.trim()) return null;

  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(eq(teams.joinCode, joinCode.trim().toUpperCase()))
    .limit(1);

  if (!team) return null;

  // Get player roster (only players without passwords — coach-added players)
  const members = await db
    .select({
      userId: teamMembers.userId,
      displayName: profiles.displayName,
    })
    .from(teamMembers)
    .innerJoin(profiles, eq(profiles.id, teamMembers.userId))
    .where(
      and(
        eq(teamMembers.teamId, team.id),
        eq(teamMembers.role, "player")
      )
    );

  return { id: team.id, name: team.name, players: members };
}

// ─── Video Assignment Actions ───────────────────────────
export async function createVideoAssignment(data: {
  title: string;
  videoUrl: string;
  description?: string;
  dueDate?: string;
  teamId: string;
}) {
  const userId = await requireUserId();

  // Verify the user is a coach on this team
  const [coachMembership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, data.teamId),
        eq(teamMembers.role, "coach")
      )
    )
    .limit(1);
  if (!coachMembership) throw new Error("Not authorized");

  await db.insert(videoAssignments).values({
    teamId: data.teamId,
    createdBy: userId,
    title: data.title,
    videoUrl: data.videoUrl,
    description: data.description || null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
  });

  revalidatePath("/assignments");
  return { success: true };
}

export async function getVideoAssignments() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (!membership) return { videoAssignments: [], comments: [] };

  const vAssignments = await db
    .select()
    .from(videoAssignments)
    .where(eq(videoAssignments.teamId, membership.teamId))
    .orderBy(desc(videoAssignments.createdAt));

  if (vAssignments.length === 0) return { videoAssignments: [], comments: [] };

  const comments = await db
    .select({
      id: videoComments.id,
      videoAssignmentId: videoComments.videoAssignmentId,
      userId: videoComments.userId,
      comment: videoComments.comment,
      createdAt: videoComments.createdAt,
      displayName: profiles.displayName,
    })
    .from(videoComments)
    .innerJoin(profiles, eq(profiles.id, videoComments.userId))
    .where(
      inArray(
        videoComments.videoAssignmentId,
        vAssignments.map((v) => v.id)
      )
    );

  return { videoAssignments: vAssignments, comments };
}

export async function submitVideoComment(
  videoAssignmentId: string,
  comment: string
) {
  const userId = await requireUserId();

  if (!comment.trim()) throw new Error("Comment cannot be empty");

  // Verify video assignment exists and user is on the team
  const [video] = await db
    .select()
    .from(videoAssignments)
    .where(eq(videoAssignments.id, videoAssignmentId))
    .limit(1);
  if (!video) throw new Error("Video assignment not found");

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, video.teamId)
      )
    )
    .limit(1);
  if (!membership) throw new Error("Not a member of this team");

  // One comment per user per video
  const [existing] = await db
    .select({ id: videoComments.id })
    .from(videoComments)
    .where(
      and(
        eq(videoComments.videoAssignmentId, videoAssignmentId),
        eq(videoComments.userId, userId)
      )
    )
    .limit(1);
  if (existing) throw new Error("Already commented on this video");

  await db.insert(videoComments).values({
    videoAssignmentId,
    userId,
    comment: comment.trim(),
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/video/${videoAssignmentId}`);
  return { success: true };
}

// ─── Question Override Actions ──────────────────────────
export async function saveQuestionOverride(data: {
  teamId: string;
  questionId: string;
  scenarioText?: string | null;
  options?: QuestionOption[] | null;
  correctOptionId?: string | null;
  explanation?: string | null;
}) {
  const userId = await requireUserId();

  // Verify the user is a coach on this team
  const [coachMembership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, data.teamId),
        eq(teamMembers.role, "coach")
      )
    )
    .limit(1);
  if (!coachMembership) throw new Error("Not authorized");

  // Get the base question to compare
  const [baseQuestion] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, data.questionId))
    .limit(1);
  if (!baseQuestion) throw new Error("Question not found");

  // Only store fields that differ from the base — null = inherit
  const overrideValues = {
    scenarioText:
      data.scenarioText != null && data.scenarioText !== baseQuestion.scenarioText
        ? data.scenarioText
        : null,
    options:
      data.options != null &&
      JSON.stringify(data.options) !== JSON.stringify(baseQuestion.options)
        ? data.options
        : null,
    correctOptionId:
      data.correctOptionId != null &&
      data.correctOptionId !== baseQuestion.correctOptionId
        ? data.correctOptionId
        : null,
    explanation:
      data.explanation != null && data.explanation !== baseQuestion.explanation
        ? data.explanation
        : null,
  };

  // If nothing actually changed, delete any existing override
  const hasAnyChange = Object.values(overrideValues).some((v) => v !== null);
  if (!hasAnyChange) {
    await db
      .delete(teamQuestionOverrides)
      .where(
        and(
          eq(teamQuestionOverrides.teamId, data.teamId),
          eq(teamQuestionOverrides.questionId, data.questionId)
        )
      );
    revalidatePath("/questions");
    return { success: true, removed: true };
  }

  // Upsert
  await db
    .insert(teamQuestionOverrides)
    .values({
      teamId: data.teamId,
      questionId: data.questionId,
      ...overrideValues,
    })
    .onConflictDoUpdate({
      target: [teamQuestionOverrides.teamId, teamQuestionOverrides.questionId],
      set: { ...overrideValues, updatedAt: new Date() },
    });

  revalidatePath("/questions");
  return { success: true, removed: false };
}

export async function resetQuestionOverride(teamId: string, questionId: string) {
  const userId = await requireUserId();

  // Verify the user is a coach on this team
  const [coachMembership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, "coach")
      )
    )
    .limit(1);
  if (!coachMembership) throw new Error("Not authorized");

  await db
    .delete(teamQuestionOverrides)
    .where(
      and(
        eq(teamQuestionOverrides.teamId, teamId),
        eq(teamQuestionOverrides.questionId, questionId)
      )
    );

  revalidatePath("/questions");
  return { success: true };
}

// ─── Assignment Detail Actions ───────────────────────────
export async function getAssignmentDetails(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Verify the user is a coach
  const [coachMembership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.role, "coach")))
    .limit(1);
  if (!coachMembership) return null;

  // Get the assignment
  const [assignment] = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(assignments.teamId, coachMembership.teamId)
      )
    )
    .limit(1);
  if (!assignment) return null;

  // Get all players on the team
  const players = await db
    .select({
      userId: teamMembers.userId,
      displayName: profiles.displayName,
    })
    .from(teamMembers)
    .innerJoin(profiles, eq(profiles.id, teamMembers.userId))
    .where(
      and(
        eq(teamMembers.teamId, coachMembership.teamId),
        eq(teamMembers.role, "player")
      )
    );

  // Get completions for this assignment
  const completions = await db
    .select()
    .from(assignmentCompletions)
    .where(eq(assignmentCompletions.assignmentId, assignmentId));

  // Get avg response times per attempt for completed players
  const attemptIds = completions
    .map((c) => c.attemptId)
    .filter((id): id is string => id !== null);
  const responseTimes =
    attemptIds.length > 0
      ? await db
          .select({
            attemptId: quizAnswers.attemptId,
            responseTimeMs: quizAnswers.responseTimeMs,
          })
          .from(quizAnswers)
          .where(inArray(quizAnswers.attemptId, attemptIds))
      : [];

  const avgTimeByAttempt = new Map<string, number | null>();
  for (const attemptId of attemptIds) {
    const times = responseTimes
      .filter((r) => r.attemptId === attemptId && r.responseTimeMs !== null)
      .map((r) => r.responseTimeMs!);
    avgTimeByAttempt.set(
      attemptId,
      times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : null
    );
  }

  const playerStatuses = players.map((player) => {
    const completion = completions.find((c) => c.userId === player.userId);
    let status: "completed" | "late" | "not_started" = "not_started";

    if (completion) {
      if (
        assignment.dueDate &&
        completion.completedAt > assignment.dueDate
      ) {
        status = "late";
      } else {
        status = "completed";
      }
    }

    return {
      userId: player.userId,
      displayName: player.displayName,
      status,
      score: completion?.score ?? null,
      completedAt: completion?.completedAt ?? null,
      avgResponseTimeMs: completion?.attemptId
        ? avgTimeByAttempt.get(completion.attemptId) ?? null
        : null,
    };
  });

  // Sort: not started first, then late, then completed
  const order = { not_started: 0, late: 1, completed: 2 };
  playerStatuses.sort((a, b) => order[a.status] - order[b.status]);

  return {
    assignment,
    players: playerStatuses,
    totalPlayers: players.length,
    completedCount: completions.length,
  };
}

// ─── Study Mode Actions ─────────────────────────────────
export async function getWrongQuestionsSummary() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Get all questions the user has answered incorrectly
  const wrongAnswers = await db
    .select({ questionId: quizAnswers.questionId })
    .from(quizAnswers)
    .innerJoin(quizAttempts, eq(quizAttempts.id, quizAnswers.attemptId))
    .where(
      and(eq(quizAttempts.userId, userId), eq(quizAnswers.isCorrect, false))
    );

  // Get questions the user has since answered correctly
  const correctAnswers = await db
    .select({ questionId: quizAnswers.questionId })
    .from(quizAnswers)
    .innerJoin(quizAttempts, eq(quizAttempts.id, quizAnswers.attemptId))
    .where(
      and(eq(quizAttempts.userId, userId), eq(quizAnswers.isCorrect, true))
    );

  const correctIds = new Set(correctAnswers.map((a) => a.questionId));
  const stillWrongIds = [
    ...new Set(
      wrongAnswers
        .map((a) => a.questionId)
        .filter((id) => !correctIds.has(id))
    ),
  ];

  return { count: stillWrongIds.length };
}

export async function startStudyMode() {
  const userId = await requireUserId();

  // Get user's team for overrides
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  // Get all questions the user has answered incorrectly
  const wrongAnswers = await db
    .select({ questionId: quizAnswers.questionId })
    .from(quizAnswers)
    .innerJoin(quizAttempts, eq(quizAttempts.id, quizAnswers.attemptId))
    .where(
      and(eq(quizAttempts.userId, userId), eq(quizAnswers.isCorrect, false))
    );

  // Get questions the user has since answered correctly
  const correctAnswers = await db
    .select({ questionId: quizAnswers.questionId })
    .from(quizAnswers)
    .innerJoin(quizAttempts, eq(quizAttempts.id, quizAnswers.attemptId))
    .where(
      and(eq(quizAttempts.userId, userId), eq(quizAnswers.isCorrect, true))
    );

  const correctIds = new Set(correctAnswers.map((a) => a.questionId));
  const stillWrongIds = [
    ...new Set(
      wrongAnswers
        .map((a) => a.questionId)
        .filter((id) => !correctIds.has(id))
    ),
  ];

  if (stillWrongIds.length === 0) {
    return { success: false, error: "No missed questions to review" };
  }

  // Pick up to 10 random wrong questions
  const shuffled = stillWrongIds.sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, 10);

  const questionList = await db
    .select()
    .from(questions)
    .where(inArray(questions.id, selectedIds));

  const mergedQuestions = await applyTeamOverrides(
    questionList,
    membership?.teamId
  );

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId,
      teamId: membership?.teamId ?? null,
      type: "practice",
      totalQuestions: mergedQuestions.length,
    })
    .returning();

  return {
    success: true,
    attemptId: attempt.id,
    questions: mergedQuestions,
  };
}

// ─── Password Reset Actions ─────────────────────────────
export async function resetPassword(email: string, newPassword: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, error: "Email is required" };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  const [user] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, normalizedEmail))
    .limit(1);

  if (!user) {
    return { success: false, error: "No account found with that email" };
  }

  const passwordHash = await hash(newPassword, 12);
  await db
    .update(profiles)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(profiles.id, user.id));

  return { success: true };
}

export async function resetPlayerPassword(
  playerId: string,
  newPassword: string
) {
  const userId = await requireUserId();

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  // Verify caller is a coach on the same team as the player
  const [coachMembership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.role, "coach")))
    .limit(1);

  if (!coachMembership) {
    return { success: false, error: "Only coaches can reset player passwords" };
  }

  const [playerMembership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, playerId),
        eq(teamMembers.teamId, coachMembership.teamId)
      )
    )
    .limit(1);

  if (!playerMembership) {
    return {
      success: false,
      error: "Player is not on your team",
    };
  }

  const passwordHash = await hash(newPassword, 12);
  await db
    .update(profiles)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(profiles.id, playerId));

  revalidatePath(`/team/${playerId}`);
  return { success: true };
}

// ─── Helpers ───────────────────────────────────────────
// ─── Team Theme Actions ───────────────────────────────
const TEAM_THEMES = [
  "default",
  "crimson",
  "ocean",
  "emerald",
  "purple",
  "sunset",
  "midnight",
  "gold",
] as const;

export type TeamTheme = (typeof TEAM_THEMES)[number];

export async function updateTeamTheme(theme: string) {
  const userId = await requireUserId();

  if (!TEAM_THEMES.includes(theme as TeamTheme)) {
    return { success: false, error: "Invalid theme" };
  }

  // Verify user is a coach on a team
  const [membership] = await db
    .select({ teamId: teamMembers.teamId, role: teamMembers.role })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (!membership || membership.role !== "coach") {
    return { success: false, error: "Only coaches can change the team theme" };
  }

  // Verify coach has pro plan
  const [profile] = await db
    .select({ plan: profiles.plan })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (profile?.plan !== "pro") {
    return { success: false, error: "Team themes require a Pro plan" };
  }

  await db
    .update(teams)
    .set({ theme })
    .where(eq(teams.id, membership.teamId));

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

export async function getTeamThemes() {
  return TEAM_THEMES;
}

// ─── Password Reset Actions ──────────────────────────
export async function requestPasswordReset(email: string) {
  if (!email) return { success: false, error: "Email is required" };

  const [user] = await db
    .select({ id: profiles.id, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.email, email.toLowerCase().trim()))
    .limit(1);

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  // Generate token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  // Send email via Resend
  const resetUrl = `https://softballiq.app/reset-password?token=${token}`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Softball IQ <noreply@softballiq.app>",
      to: email.toLowerCase().trim(),
      subject: "Reset your Softball IQ password",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #c9a227, #d4af37); padding: 24px 32px; text-align: center;">
            <img src="https://softballiq.app/logo.png" alt="Softball IQ" height="36" style="height: 36px; width: auto;" />
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="color: #ffffff; margin: 0 0 12px; font-size: 20px;">Reset Your Password</h2>
            <p style="color: #a0a0b0; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
              We received a request to reset your Softball IQ password. Click the button below to set a new password. This link expires in 1 hour.
            </p>

            <!-- Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #c9a227; color: #1a1a2e; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                Reset Password
              </a>
            </div>

            <!-- Divider -->
            <div style="border-top: 1px solid #2a2a3e; margin: 24px 0;"></div>

            <p style="color: #666; font-size: 12px; margin: 0 0 8px;">
              If you didn&rsquo;t request this, you can safely ignore this email. Your password will not be changed.
            </p>
            <p style="color: #555; font-size: 11px; margin: 0;">
              If the button doesn&rsquo;t work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #c9a227; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #15152a; padding: 16px 32px; text-align: center;">
            <p style="color: #555; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} Softball IQ &middot; Game IQ training for 8U&ndash;14U softball
            </p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error("Failed to send reset email:", e);
    return { success: false, error: "Failed to send email. Please try again." };
  }

  return { success: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { success: false, error: "Token and password are required" };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  // Find valid token
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (!resetToken) {
    return { success: false, error: "Invalid or expired reset link" };
  }
  if (resetToken.usedAt) {
    return { success: false, error: "This reset link has already been used" };
  }
  if (new Date() > resetToken.expiresAt) {
    return { success: false, error: "This reset link has expired. Please request a new one." };
  }

  // Hash and update password
  const passwordHash = await hash(newPassword, 12);
  await db
    .update(profiles)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(profiles.id, resetToken.userId));

  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return { success: true };
}

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
