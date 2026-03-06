"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SoftballField } from "@/components/quiz/softball-field";
import { createCustomQuestion, getDashboardData } from "@/app/actions";
import type { Situation } from "@/lib/db/schema";
import { PlusCircle, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";

type Option = { id: string; text: string };

const OPTION_IDS = ["a", "b", "c", "d"];

const BALL_HIT_POSITIONS = [
  { value: "pitcher", label: "Pitcher" },
  { value: "catcher", label: "Catcher" },
  { value: "first_base", label: "First Baseman" },
  { value: "second_base_2b", label: "Second Baseman" },
  { value: "third_base", label: "Third Baseman" },
  { value: "shortstop", label: "Shortstop" },
  { value: "left_field", label: "Left Field" },
  { value: "center_field", label: "Center Field" },
  { value: "right_field", label: "Right Field" },
];

export default function NewCustomQuestionPage() {
  const router = useRouter();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Question fields
  const [scenarioText, setScenarioText] = useState("");
  const [category, setCategory] = useState<"baserunning" | "fielding" | "hitting" | "general">("general");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [explanation, setExplanation] = useState("");

  // Options
  const [options, setOptions] = useState<Option[]>([
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState("a");

  // Field diagram (situation)
  const [showDiagram, setShowDiagram] = useState(false);
  const [runners, setRunners] = useState<string[]>([]);
  const [outs, setOuts] = useState(0);
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [inning, setInning] = useState<number | "">("");
  const [scoreUs, setScoreUs] = useState<number | "">("");
  const [scoreThem, setScoreThem] = useState<number | "">("");
  const [ballHitTo, setBallHitTo] = useState("");

  useEffect(() => {
    getDashboardData().then((data) => {
      if (data?.membership) setTeamId(data.membership.teamId);
    });
  }, []);

  function toggleRunner(base: string) {
    setRunners((prev) =>
      prev.includes(base) ? prev.filter((r) => r !== base) : [...prev, base]
    );
  }

  function addOption() {
    const nextId = OPTION_IDS[options.length];
    if (!nextId) return;
    setOptions((prev) => [...prev, { id: nextId, text: "" }]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
    if (correctOptionId === id) setCorrectOptionId(options.find((o) => o.id !== id)?.id ?? "a");
  }

  function updateOptionText(id: string, text: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  const situation: Situation | null = showDiagram
    ? {
        runners,
        outs,
        count: { balls, strikes },
        inning: inning !== "" ? Number(inning) : 1,
        score:
          scoreUs !== "" && scoreThem !== ""
            ? { us: Number(scoreUs), them: Number(scoreThem) }
            : { us: 0, them: 0 },
        ballHitTo: ballHitTo || undefined,
      }
    : null;

  async function handleCreate() {
    if (!teamId) return;
    setError("");

    if (!scenarioText.trim()) {
      setError("Scenario text is required.");
      return;
    }
    if (options.some((o) => !o.text.trim())) {
      setError("All answer options must have text.");
      return;
    }
    if (!explanation.trim()) {
      setError("Explanation is required.");
      return;
    }

    setLoading(true);
    try {
      await createCustomQuestion({
        teamId,
        scenarioText,
        options,
        correctOptionId,
        explanation,
        category,
        difficulty,
        situation,
      });
      router.push("/questions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create question.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-7 px-2">
          <Link href="/questions">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Create Custom Question</h1>
      </div>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as typeof category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baserunning">Baserunning</SelectItem>
                  <SelectItem value="fielding">Fielding</SelectItem>
                  <SelectItem value="hitting">Hitting</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as typeof difficulty)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Textarea
              id="scenario"
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="Describe the game situation and what the player must decide..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm text-muted-foreground">Answer Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Select the radio button next to the correct answer.
          </p>
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOptionId === opt.id}
                onChange={() => setCorrectOptionId(opt.id)}
                className="accent-green-500 shrink-0"
              />
              <Input
                value={opt.text}
                onChange={(e) => updateOptionText(opt.id, e.target.value)}
                placeholder={`Option ${opt.id.toUpperCase()}`}
                className="text-sm"
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 shrink-0"
                  onClick={() => removeOption(opt.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={addOption}
            >
              <PlusCircle className="size-3 mr-1" />
              Add Option
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm text-muted-foreground">Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why the correct answer is right and what the player should know..."
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Field Diagram (optional)</CardTitle>
            <button
              onClick={() => setShowDiagram((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showDiagram ? "bg-blue-600" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  showDiagram ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardHeader>

        {showDiagram && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Runners on Base</Label>
              <div className="flex gap-3">
                {["first", "second", "third"].map((base) => (
                  <label key={base} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={runners.includes(base)}
                      onChange={() => toggleRunner(base)}
                      className="accent-amber-400"
                    />
                    {base.charAt(0).toUpperCase() + base.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Outs</Label>
                <Select value={String(outs)} onValueChange={(v) => setOuts(Number(v))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Balls</Label>
                <Select value={String(balls)} onValueChange={(v) => setBalls(Number(v))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Strikes</Label>
                <Select value={String(strikes)} onValueChange={(v) => setStrikes(Number(v))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Inning</Label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={inning}
                  onChange={(e) => setInning(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 3"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Score (Us)</Label>
                <Input
                  type="number"
                  min={0}
                  value={scoreUs}
                  onChange={(e) => setScoreUs(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Score (Them)</Label>
                <Input
                  type="number"
                  min={0}
                  value={scoreThem}
                  onChange={(e) => setScoreThem(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Ball Hit To (optional)</Label>
              <Select value={ballHitTo} onValueChange={setBallHitTo}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="No trajectory arrow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {BALL_HIT_POSITIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {situation && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <SoftballField situation={situation} className="rounded-lg overflow-hidden" />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        onClick={handleCreate}
        className="w-full"
        size="lg"
        disabled={!teamId || loading}
      >
        {loading ? "Creating..." : "Create Question"}
      </Button>
    </div>
  );
}
