"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveQuestionOverride, resetQuestionOverride } from "@/app/actions";
import type { QuestionOption } from "@/lib/db/schema";
import { Pencil, RotateCcw } from "lucide-react";

type Question = {
  id: string;
  scenarioText: string;
  options: QuestionOption[] | unknown;
  correctOptionId: string;
  explanation: string;
  hasOverride: boolean;
};

export function QuestionEditButton({
  question,
  teamId,
}: {
  question: Question;
  teamId: string;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const opts = question.options as QuestionOption[];

  const [scenarioText, setScenarioText] = useState(question.scenarioText);
  const [options, setOptions] = useState<QuestionOption[]>(opts);
  const [correctOptionId, setCorrectOptionId] = useState(
    question.correctOptionId
  );
  const [explanation, setExplanation] = useState(question.explanation);

  // Reset form state when dialog opens
  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setScenarioText(question.scenarioText);
      setOptions(opts);
      setCorrectOptionId(question.correctOptionId);
      setExplanation(question.explanation);
    }
    setOpen(isOpen);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveQuestionOverride({
        teamId,
        questionId: question.id,
        scenarioText,
        options,
        correctOptionId,
        explanation,
      });
      setOpen(false);
    } catch (e) {
      console.error("Failed to save override", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await resetQuestionOverride(teamId, question.id);
      setOpen(false);
    } catch (e) {
      console.error("Failed to reset override", e);
    } finally {
      setResetting(false);
    }
  }

  function updateOptionText(optionId: string, text: string) {
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, text } : o))
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <Pencil className="size-3 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question for Your Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Textarea
              id="scenario"
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Answer Options</Label>
            {options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctOptionId === opt.id}
                  onChange={() => setCorrectOptionId(opt.id)}
                  className="accent-green-500"
                />
                <Input
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Select the radio button next to the correct answer.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          {question.hasOverride && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetting}
              className="mr-auto"
            >
              <RotateCcw className="size-3 mr-1" />
              {resetting ? "Resetting..." : "Reset to Original"}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save for Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
