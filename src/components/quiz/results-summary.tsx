"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Flame, Home, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface ResultsSummaryProps {
  score: number;
  totalQuestions: number;
  quizType?: string;
  streakCount?: number;
  actions?: React.ReactNode;
  answers: {
    questionText: string;
    selectedOptionText: string;
    correctOptionText: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export function ResultsSummary({
  score,
  totalQuestions,
  quizType,
  streakCount,
  actions,
  answers,
}: ResultsSummaryProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect game! You're untouchable!";
    if (percentage >= 80) return "Crushed it — that's a grand slam!";
    if (percentage >= 60) return "Solid contact — keep swinging!";
    if (percentage >= 40) return "Warming up — next round is yours!";
    return "Shake it off — get back in the box!";
  };

  const ringColor =
    percentage >= 80
      ? "stroke-green-500"
      : percentage >= 50
        ? "stroke-amber-500"
        : "stroke-red-500";

  const circumference = 2 * Math.PI * 54; // r=54
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Score card */}
      <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6 text-center space-y-4">
          {/* Score ring */}
          <div className="relative inline-flex items-center justify-center">
            <svg width="128" height="128" className="-rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                fill="none"
                strokeWidth="8"
                className="stroke-muted/30"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${ringColor} transition-all duration-700 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold leading-none">
                {percentage}%
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {score}/{totalQuestions}
              </span>
            </div>
          </div>

          <p className="text-lg font-semibold">{getMessage()}</p>

          <div className="flex justify-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{score} correct</span>
            </div>
            {streakCount !== undefined && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm">{streakCount} day streak</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answer review */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Review
        </h3>
        {answers.map((answer, i) => (
          <AnswerReviewCard key={i} answer={answer} index={i} />
        ))}
      </div>

      {/* Actions */}
      {actions ?? (
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          {quizType === "practice" ? (
            <Button asChild className="flex-1">
              <Link href="/study">
                <BookOpen className="mr-2 h-4 w-4" />
                Study Again
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1">
              <Link href="/daily-rep">Play Again</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function AnswerReviewCard({
  answer,
  index,
}: {
  answer: ResultsSummaryProps["answers"][number];
  index: number;
}) {
  const [expanded, setExpanded] = useState(!answer.isCorrect);

  return (
    <Card
      className={
        answer.isCorrect ? "border-green-500/20" : "border-red-500/20"
      }
    >
      <CardContent className="pt-4 space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-start gap-2 w-full text-left"
        >
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${
              answer.isCorrect
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {answer.isCorrect ? "✓" : "✗"}
          </span>
          <p className="text-sm flex-1">{answer.questionText}</p>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          )}
        </button>
        {expanded && (
          <div className="pl-8 space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Your answer:{" "}
              <span className={answer.isCorrect ? "text-green-400" : "text-red-400"}>
                {answer.selectedOptionText}
              </span>
            </p>
            {!answer.isCorrect && (
              <p className="text-xs text-muted-foreground">
                Correct answer:{" "}
                <span className="text-green-400">{answer.correctOptionText}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground/80 italic pt-1">
              {answer.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
