"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { QuestionCard } from "@/components/quiz/question-card";
import {
  startAssignment,
  submitAnswer,
  completeAssignment,
} from "@/app/actions";
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

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const result = await startAssignment(quizId);
        if (result.success && result.attemptId && result.questions) {
          setAttemptId(result.attemptId);
          setAssignmentId(result.assignmentId!);
          setQuestions(result.questions as Question[]);
          setTimeLimitSeconds(result.timeLimitSeconds ?? null);
        } else {
          setError(result.error || "Failed to load quiz");
        }
      } catch {
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [quizId]);

  const handleAnswer = async (optionId: string, responseTimeMs: number) => {
    if (!attemptId) return;
    try {
      const result = await submitAnswer(
        attemptId,
        questions[currentIndex].id,
        optionId,
        responseTimeMs
      );
      return result?.isCorrect ?? false;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (attemptId && assignmentId) {
      try {
        await completeAssignment(assignmentId, attemptId);
      } catch {
        // Best-effort completion
      }
      router.push(`/quiz/results/${attemptId}`);
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
      <h1 className="text-xl font-bold">Assignment</h1>
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
        timeLimit={timeLimitSeconds}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  );
}
