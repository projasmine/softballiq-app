"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/quiz/question-card";
import { startDailyRep, submitAnswer, completeQuiz } from "@/app/actions";
import type { QuestionOption, Situation } from "@/lib/db/schema";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    const init = async () => {
      try {
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

  const handleAnswer = async (optionId: string) => {
    if (!attemptId) return;
    try {
      const result = await submitAnswer(
        attemptId,
        questions[currentIndex].id,
        optionId
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
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Daily Rep</h1>
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
