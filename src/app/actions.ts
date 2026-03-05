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
} from "@/lib/db/schema";
import type { QuestionOption } from "@/lib/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
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
export async function createTeam(name: string) {
  const userId = await requireUserId();

  const joinCode = generateJoinCode();
  const [team] = await db
    .insert(teams)
    .values({ name, joinCode, createdBy: userId })
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

  // Get 5 questions, preferring position-relevant ones
  let questionPool = await db
    .select()
    .from(questions)
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
  selectedOptionId: string
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

      return {
        userId: member.userId,
        displayName: member.displayName,
        totalScore,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
        currentStreak: streak?.currentStreak ?? 0,
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

// ─── Helpers ───────────────────────────────────────────
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
