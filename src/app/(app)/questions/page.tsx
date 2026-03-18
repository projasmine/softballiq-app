import { getQuestionBank } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, difficultyLabel } from "@/lib/utils";
import { QuestionEditButton } from "@/components/question-edit-form";
import type { QuestionOption } from "@/lib/db/schema";

export default async function QuestionsPage() {
  const { questions: questionsList, teamId } = await getQuestionBank();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Question Bank</h1>
        <Badge variant="secondary">{questionsList.length} questions</Badge>
      </div>

      {questionsList.map((q) => (
        <Card key={q.id}>
          <CardContent className="pt-3 pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {categoryLabel[q.category] ?? q.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {difficultyLabel[q.difficulty] ?? q.difficulty}
              </Badge>
              {q.hasOverride && (
                <Badge className="text-xs bg-amber-600/20 text-amber-400 border-amber-600/30">
                  Customized
                </Badge>
              )}
              <div className="ml-auto">
                {teamId && (
                  <QuestionEditButton
                    question={{
                      id: q.id,
                      scenarioText: q.scenarioText,
                      options: q.options,
                      correctOptionId: q.correctOptionId,
                      explanation: q.explanation,
                      hasOverride: q.hasOverride,
                    }}
                    teamId={teamId}
                  />
                )}
              </div>
            </div>
            <p className="text-sm">{q.scenarioText}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              {(q.options as QuestionOption[]).map((opt) => (
                <p
                  key={opt.id}
                  className={
                    opt.id === q.correctOptionId
                      ? "text-green-400 font-medium"
                      : ""
                  }
                >
                  {opt.id === q.correctOptionId ? "✓" : "○"} {opt.text}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
