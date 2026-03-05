"use client";

import { useEffect, useState } from "react";
import { ResultsSummary } from "@/components/quiz/results-summary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RotateCcw, Users } from "lucide-react";

type StoredResults = {
  score: number;
  totalQuestions: number;
  answers: {
    questionText: string;
    selectedOptionText: string;
    correctOptionText: string;
    isCorrect: boolean;
    explanation: string;
  }[];
};

export default function PlayResultsPage() {
  const [results, setResults] = useState<StoredResults | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("playResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  if (!results) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">No results found.</p>
        <Button asChild>
          <Link href="/play">Play Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Results</h1>
      <ResultsSummary
        score={results.score}
        totalQuestions={results.totalQuestions}
        answers={results.answers}
        actions={
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/play">
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/join">
                <Users className="mr-2 h-4 w-4" />
                Join a Team
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
