"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/quiz/question-card";
import { Badge } from "@/components/ui/badge";
import type { QuestionOption, Situation } from "@/lib/db/schema";
import { Loader2 } from "lucide-react";

const AGE_GROUPS = ["8U", "10U", "12U", "14U"] as const;

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
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [error, setError] = useState("");

  const startQuiz = (age: string) => {
    setAgeGroup(age);
    setLoading(true);
    setError("");
    fetch(`/api/questions/random?ageGroup=${age}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setError("No questions available for this age group yet.");
          setAgeGroup(null);
        } else {
          setQuestions(data);
        }
      })
      .catch(() => {
        setError("Failed to load questions");
        setAgeGroup(null);
      })
      .finally(() => setLoading(false));
  };

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

  // Age group selector
  if (!ageGroup || questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Quick Play</h1>
          <p className="text-sm text-muted-foreground">
            Select your age group to start
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {AGE_GROUPS.map((age) => (
                <button
                  key={age}
                  onClick={() => startQuiz(age)}
                  className="p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-center space-y-1"
                >
                  <span className="text-2xl font-bold">{age}</span>
                  <p className="text-xs text-muted-foreground">
                    {age === "8U" && "Coach/player pitch"}
                    {age === "10U" && "Player pitch, limited stealing"}
                    {age === "12U" && "Standard fastpitch rules"}
                    {age === "14U" && "7-inning games"}
                  </p>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Join a team to track your stats and compete on the leaderboard.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Quick Play</h1>
        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
          {ageGroup}
        </Badge>
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
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Join a team to track your stats and compete on the leaderboard.
        </p>
      </div>
    </div>
  );
}
