"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SoftballField } from "./softball-field";
import { BatterPlate } from "./batter-plate";
import { AnswerOption } from "./answer-option";
import { ExplanationPanel } from "./explanation-panel";
import type { QuestionOption, Situation } from "@/lib/db/schema";
import { categoryColorClass } from "@/lib/utils";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
  scenarioText: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  situation?: Situation | null;
  playerPosition?: string;
  timeLimit?: number | null;
  onAnswer: (optionId: string, responseTimeMs: number) => void;
  onNext: () => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  category,
  difficulty,
  scenarioText,
  options,
  correctOptionId,
  explanation,
  situation,
  playerPosition,
  timeLimit,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    timeLimit ?? null
  );
  const submittingRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  const handleSelect = useCallback(
    (optionId: string) => {
      if (answered || submittingRef.current) return;
      submittingRef.current = true;
      const responseTimeMs = Date.now() - startTimeRef.current;
      setSelectedId(optionId);
      setAnswered(true);
      setTimeLeft(null);
      onAnswer(optionId, responseTimeMs);
    },
    [answered, onAnswer]
  );

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || answered) return;
    const timer = setTimeout(() => setTimeLeft((t) => (t ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, answered]);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft !== 0 || answered) return;
    // Pick a wrong option to auto-submit
    const wrongOption = options.find((o) => o.id !== correctOptionId);
    if (wrongOption) {
      handleSelect(wrongOption.id);
    }
  }, [timeLeft, answered, options, correctOptionId, handleSelect]);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          {timeLeft !== null && !answered && (
            <Badge
              variant="outline"
              className={
                timeLeft <= 5
                  ? "border-red-500/50 text-red-400 animate-pulse"
                  : "border-amber-500/50 text-amber-400"
              }
            >
              {timeLeft}s
            </Badge>
          )}
          <Badge variant="outline" className={categoryColorClass[category] ?? ""}>
            {category}
          </Badge>
          <Badge variant="outline">{difficulty}</Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{
            width: `${(questionNumber / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Visual diagram */}
      {category === "hitting" || category === "general" ? (
        <BatterPlate situation={situation} className="mb-2" />
      ) : situation ? (
        <SoftballField
          situation={situation}
          playerPosition={playerPosition}
          className="mb-2"
        />
      ) : null}


      {/* Scenario */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-3">
          <p className="text-base leading-relaxed">{scenarioText}</p>
        </CardContent>
      </Card>

      {/* Answer options */}
      <div className="space-y-3">
        {options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            isSelected={selectedId === option.id}
            isCorrect={option.id === correctOptionId}
            revealed={answered}
            onSelect={() => handleSelect(option.id)}
          />
        ))}
      </div>

      {/* Explanation */}
      {answered && (
        <ExplanationPanel
          explanation={explanation}
          isCorrect={selectedId === correctOptionId}
          onNext={onNext}
        />
      )}
    </div>
  );
}
