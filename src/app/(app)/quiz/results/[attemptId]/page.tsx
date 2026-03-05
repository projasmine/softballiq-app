import { getAttemptResults } from "@/app/actions";
import { ResultsSummary } from "@/components/quiz/results-summary";
import { redirect } from "next/navigation";
import type { QuestionOption } from "@/lib/db/schema";

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const data = await getAttemptResults(attemptId);

  if (!data.attempt) redirect("/dashboard");

  const answers = data.answers.map((a) => {
    const options = a.options as QuestionOption[];
    const selectedOption = options.find((o) => o.id === a.selectedOptionId);
    const correctOption = options.find((o) => o.id === a.correctOptionId);
    return {
      questionText: a.scenarioText,
      selectedOptionText: selectedOption?.text ?? "",
      correctOptionText: correctOption?.text ?? "",
      isCorrect: a.isCorrect,
      explanation: a.explanation,
    };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Results</h1>
      <ResultsSummary
        score={data.attempt.score ?? 0}
        totalQuestions={data.attempt.totalQuestions}
        answers={answers}
      />
    </div>
  );
}
