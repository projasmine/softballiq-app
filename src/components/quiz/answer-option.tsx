"use client";

import { Check, X } from "lucide-react";
import type { QuestionOption } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface AnswerOptionProps {
  option: QuestionOption;
  isSelected: boolean;
  isCorrect: boolean;
  revealed: boolean;
  onSelect: () => void;
}

export function AnswerOption({
  option,
  isSelected,
  isCorrect,
  revealed,
  onSelect,
}: AnswerOptionProps) {
  const getStyles = () => {
    if (!revealed) {
      return "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-[0.98]";
    }
    if (isCorrect) {
      return "border-green-500 bg-green-500/10 animate-answer-bounce";
    }
    if (isSelected && !isCorrect) {
      return "border-red-500 bg-red-500/10 animate-answer-shake";
    }
    return "border-border opacity-50";
  };

  return (
    <button
      onClick={onSelect}
      disabled={revealed}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all min-h-[56px]",
        getStyles()
      )}
    >
      <span className="flex-1 text-sm font-medium">{option.text}</span>
      {revealed && isCorrect && (
        <Check className="h-5 w-5 text-green-500 shrink-0" />
      )}
      {revealed && isSelected && !isCorrect && (
        <X className="h-5 w-5 text-red-500 shrink-0" />
      )}
    </button>
  );
}
