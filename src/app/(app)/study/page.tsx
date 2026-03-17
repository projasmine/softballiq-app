"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuestionCard } from "@/components/quiz/question-card";
import {
  startStudyMode,
  submitAnswer,
  completeQuiz,
  getWrongQuestionsSummary,
} from "@/app/actions";
import type { QuestionOption, Situation } from "@/lib/db/schema";
import { Loader2, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export default function StudyModePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [wrongCount, setWrongCount] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const summary = await getWrongQuestionsSummary();
        setWrongCount(summary?.count ?? 0);
      } catch {
        setError("Failed to load study data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const result = await startStudyMode();
      if (result.success && result.attemptId && result.questions) {
        setAttemptId(result.attemptId);
        setQuestions(result.questions as Question[]);
      } else {
        setError(result.error || "Failed to start study mode");
      }
    } catch {
      setError("Failed to start study mode");
    } finally {
      setStarting(false);
    }
  };

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

  // Quiz in progress
  if (attemptId && questions.length > 0) {
    const question = questions[currentIndex];
    if (!question) return null;

    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Study Mode</h1>
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

  // No wrong questions — all clear
  if (wrongCount === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Study Mode</h1>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ve answered every question correctly. Keep doing your
              daily reps and check back if you miss any.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Entry screen — show count and start button
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Study Mode</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {wrongCount} {wrongCount === 1 ? "question" : "questions"} to
                review
              </p>
              <p className="text-sm text-muted-foreground">
                Practice the questions you&apos;ve missed until you get them
                right
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button
            onClick={handleStart}
            className="w-full"
            size="lg"
            disabled={starting}
          >
            {starting ? "Loading questions..." : "Start Studying"}
          </Button>
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
