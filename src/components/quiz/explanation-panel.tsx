"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const correctMessages = [
  "Nice play!",
  "You nailed it!",
  "All-star move!",
  "Textbook play!",
  "Coach's favorite!",
];

const incorrectMessages = [
  "Almost had it!",
  "Good thinking — here's the play:",
  "Tricky one! Here's the key:",
  "Close! Remember this:",
];

interface ExplanationPanelProps {
  explanation: string;
  isCorrect: boolean;
  onNext: () => void;
}

export function ExplanationPanel({
  explanation,
  isCorrect,
  onNext,
}: ExplanationPanelProps) {
  const message = useMemo(() => {
    const pool = isCorrect ? correctMessages : incorrectMessages;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [isCorrect]);

  return (
    <Card
      className={
        isCorrect
          ? "border-green-500/30 bg-green-500/5"
          : "border-red-500/30 bg-red-500/5"
      }
    >
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="font-semibold text-sm">{message}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {explanation}
        </p>
        <Button onClick={onNext} className="w-full mt-2" size="lg">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
