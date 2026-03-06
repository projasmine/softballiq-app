import { getQuestionBank } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionEditButton } from "@/components/question-edit-form";
import { DeleteCustomQuestionButton } from "@/components/delete-custom-question-button";
import type { QuestionOption } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function QuestionsPage() {
  const { questions: questionsList, teamId } = await getQuestionBank();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Question Bank</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{questionsList.length} questions</Badge>
          {teamId && (
            <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs">
              <Link href="/questions/new">
                <PlusCircle className="size-3 mr-1" />
                Create
              </Link>
            </Button>
          )}
        </div>
      </div>

      {questionsList.map((q) => {
        const isCustom = "isCustom" in q && q.isCustom === true;
        return (
          <Card key={q.id}>
            <CardContent className="pt-3 pb-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {q.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {q.difficulty}
                </Badge>
                {isCustom && (
                  <Badge className="text-xs bg-blue-600/20 text-blue-400 border-blue-600/30">
                    Custom
                  </Badge>
                )}
                {q.hasOverride && !isCustom && (
                  <Badge className="text-xs bg-amber-600/20 text-amber-400 border-amber-600/30">
                    Customized
                  </Badge>
                )}
                <div className="ml-auto flex items-center gap-1">
                  {teamId && !isCustom && (
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
                  {isCustom && teamId && (
                    <DeleteCustomQuestionButton questionId={q.id} />
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
        );
      })}
    </div>
  );
}
