"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/quiz/question-card";
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

type AnswerRecord = {
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  isCorrect: boolean;
  explanation: string;
};

export default function PlayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/questions/random")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch(() => setError("Failed to load questions"))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (optionId: string, _responseTimeMs: number) => {
    const q = questions[currentIndex];
    const isCorrect = optionId === q.correctOptionId;
    if (isCorrect) setScore((s) => s + 1);

    const selectedOption = q.options.find((o) => o.id === optionId);
    const correctOption = q.options.find((o) => o.id === q.correctOptionId);
    setAnswers((prev) => [
      ...prev,
      {
        questionText: q.scenarioText,
        selectedOptionText: selectedOption?.text ?? "",
        correctOptionText: correctOption?.text ?? "",
        isCorrect,
        explanation: q.explanation,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      sessionStorage.setItem(
        "playResults",
        JSON.stringify({ score, totalQuestions: questions.length, answers })
      );
      router.push("/play/results");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error || "No questions available"}
        </p>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Quick Play</h1>
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
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Join a team to track your stats and compete on the leaderboard!
        </p>
      </div>
    </div>
  );
}
