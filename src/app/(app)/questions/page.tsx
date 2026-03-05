import { getQuestionBank } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuestionOption } from "@/lib/db/schema";

export default async function QuestionsPage() {
  const questionsList = await getQuestionBank();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Question Bank</h1>
        <Badge variant="secondary">{questionsList.length} questions</Badge>
      </div>

      {questionsList.map((q) => (
        <Card key={q.id}>
          <CardContent className="pt-3 pb-3 space-y-2">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {q.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {q.difficulty}
              </Badge>
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
