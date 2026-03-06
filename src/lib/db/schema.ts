import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  varchar,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["player", "coach"]);
export const quizTypeEnum = pgEnum("quiz_type", [
  "daily_rep",
  "assignment",
  "practice",
]);
export const difficultyEnum = pgEnum("difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const categoryEnum = pgEnum("category", [
  "baserunning",
  "fielding",
  "hitting",
  "general",
]);

// ─── Profiles ───────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name").notNull(),
  role: roleEnum("role").notNull().default("player"),
  positions: jsonb("positions").$type<string[]>().default([]),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Teams ──────────────────────────────────────────────
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  joinCode: varchar("join_code", { length: 8 }).notNull().unique(),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Team Members ───────────────────────────────────────
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  role: roleEnum("role").notNull().default("player"),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Questions ──────────────────────────────────────────
export type QuestionOption = {
  id: string;
  text: string;
};

export type Situation = {
  runners: string[];
  outs: number;
  count: { balls: number; strikes: number };
  inning: number;
  score: { us: number; them: number };
  ballHitTo?: string;
  perspective?: string;
};

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: categoryEnum("category").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("beginner"),
  scenarioText: text("scenario_text").notNull(),
  options: jsonb("options").$type<QuestionOption[]>().notNull(),
  correctOptionId: text("correct_option_id").notNull(),
  explanation: text("explanation").notNull(),
  positions: jsonb("positions").$type<string[]>().default([]),
  situation: jsonb("situation").$type<Situation>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Team Question Overrides ────────────────────────────
export const teamQuestionOverrides = pgTable(
  "team_question_overrides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    scenarioText: text("scenario_text"),
    options: jsonb("options").$type<QuestionOption[]>(),
    correctOptionId: text("correct_option_id"),
    explanation: text("explanation"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique().on(t.teamId, t.questionId)]
);

// ─── Quiz Attempts ──────────────────────────────────────
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  type: quizTypeEnum("type").notNull(),
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Quiz Answers ───────────────────────────────────────
export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id")
    .references(() => quizAttempts.id, { onDelete: "cascade" })
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id)
    .notNull(),
  selectedOptionId: text("selected_option_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Daily Streaks ──────────────────────────────────────
export const dailyStreaks = pgTable("daily_streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: timestamp("last_completed_date", { mode: "date" }),
});

// ─── Assignments ────────────────────────────────────────
export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
  title: text("title").notNull(),
  categoryFilter: categoryEnum("category_filter"),
  difficultyFilter: difficultyEnum("difficulty_filter"),
  questionCount: integer("question_count").notNull().default(5),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Assignment Questions ───────────────────────────────
export const assignmentQuestions = pgTable("assignment_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .references(() => assignments.id, { onDelete: "cascade" })
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id)
    .notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

// ─── Assignment Completions ─────────────────────────────
export const assignmentCompletions = pgTable("assignment_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .references(() => assignments.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  attemptId: uuid("attempt_id").references(() => quizAttempts.id),
  score: integer("score"),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Video Assignments ─────────────────────────────────
export const videoAssignments = pgTable("video_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Push Subscriptions ────────────────────────────────
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Video Comments ────────────────────────────────────
export const videoComments = pgTable("video_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoAssignmentId: uuid("video_assignment_id")
    .references(() => videoAssignments.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Relations ──────────────────────────────────────────
export const profilesRelations = relations(profiles, ({ many }) => ({
  teamMembers: many(teamMembers),
  quizAttempts: many(quizAttempts),
  dailyStreaks: many(dailyStreaks),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [teams.createdBy],
    references: [profiles.id],
  }),
  members: many(teamMembers),
  assignments: many(assignments),
  questionOverrides: many(teamQuestionOverrides),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [teamMembers.userId],
    references: [profiles.id],
  }),
}));

export const quizAttemptsRelations = relations(
  quizAttempts,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [quizAttempts.userId],
      references: [profiles.id],
    }),
    answers: many(quizAnswers),
  })
);

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [quizAnswers.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(questions, {
    fields: [quizAnswers.questionId],
    references: [questions.id],
  }),
}));

export const assignmentsRelations = relations(
  assignments,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [assignments.teamId],
      references: [teams.id],
    }),
    creator: one(profiles, {
      fields: [assignments.createdBy],
      references: [profiles.id],
    }),
    questions: many(assignmentQuestions),
    completions: many(assignmentCompletions),
  })
);

export const assignmentQuestionsRelations = relations(
  assignmentQuestions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentQuestions.assignmentId],
      references: [assignments.id],
    }),
    question: one(questions, {
      fields: [assignmentQuestions.questionId],
      references: [questions.id],
    }),
  })
);

export const assignmentCompletionsRelations = relations(
  assignmentCompletions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentCompletions.assignmentId],
      references: [assignments.id],
    }),
    user: one(profiles, {
      fields: [assignmentCompletions.userId],
      references: [profiles.id],
    }),
  })
);

export const teamQuestionOverridesRelations = relations(
  teamQuestionOverrides,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamQuestionOverrides.teamId],
      references: [teams.id],
    }),
    question: one(questions, {
      fields: [teamQuestionOverrides.questionId],
      references: [questions.id],
    }),
  })
);

export const videoAssignmentsRelations = relations(
  videoAssignments,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [videoAssignments.teamId],
      references: [teams.id],
    }),
    creator: one(profiles, {
      fields: [videoAssignments.createdBy],
      references: [profiles.id],
    }),
    comments: many(videoComments),
  })
);

export const videoCommentsRelations = relations(videoComments, ({ one }) => ({
  videoAssignment: one(videoAssignments, {
    fields: [videoComments.videoAssignmentId],
    references: [videoAssignments.id],
  }),
  user: one(profiles, {
    fields: [videoComments.userId],
    references: [profiles.id],
  }),
}));
