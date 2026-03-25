"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/quiz/question-card";
import { startDailyRep, submitAnswer, completeQuiz, getDashboardData } from "@/app/actions";
import type { QuestionOption, Situation } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

type Question = {
  id: string;
  category: string;
  difficulty: string;
  scenarioText: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  situation: Situation | null;
  positions: string[] | null;
};

export default function DailyRepPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const dashData = await getDashboardData();
        if (dashData?.profile) setPlayerName(dashData.profile.displayName);
        const result = await startDailyRep();
        if (result.success && result.attemptId && result.questions) {
          setAttemptId(result.attemptId);
          setQuestions(result.questions as Question[]);
        } else {
          setError(result.error || "Failed to start quiz");
        }
      } catch {
        setError("Failed to start quiz");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAnswer = async (optionId: string, responseTimeMs: number) => {
    if (!attemptId) return;
    try {
      const result = await submitAnswer(
        attemptId,
        questions[currentIndex].id,
        optionId,
        responseTimeMs
      );
      if (result?.isCorrect) setScore((s) => s + 1);
      return result?.isCorrect ?? false;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      if (attemptId) {
        try {
          await completeQuiz(attemptId);
        } catch {
          // Best-effort completion
        }
        router.push(`/quiz/results/${attemptId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    const isLimitError = error.includes("free reps");
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        {isLimitError ? (
          <>
            <Lock className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-semibold">Weekly Limit Reached</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                You&apos;ve completed all 5 free reps this week. Upgrade to Pro for unlimited reps!
              </p>
            </div>
            <Card className="w-full max-w-xs">
              <CardContent className="pt-4 pb-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">Pro — Unlimited Reps</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask your coach to upgrade or enter a promo code in Settings.
                </p>
              </CardContent>
            </Card>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">{error}</p>
        )}
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Daily Rep</h1>
        {playerName && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            <User className="h-3 w-3" />
            {playerName}
          </span>
        )}
      </div>
      <QuestionCard
        key={question.id}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        category={question.category}
        difficulty={question.difficulty}
        scenarioText={question.scenarioText}
        options={question.options}
        correctOptionId={question.correctOptionId}
        explanation={question.explanation}
        situation={question.situation}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  );
}
