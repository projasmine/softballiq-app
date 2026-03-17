"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAssignment, getDashboardData } from "@/app/actions";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const data = await getDashboardData();
      if (data?.membership) {
        setTeamId(data.membership.teamId);
      }
    };
    init();
  }, []);

  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!teamId || !title) return;
    setLoading(true);
    setError("");

    try {
      await createAssignment({
        title,
        teamId,
        categoryFilter: category || undefined,
        difficultyFilter: difficulty || undefined,
        questionCount,
        timeLimitSeconds: timeLimit ? Number(timeLimit) : undefined,
        dueDate: dueDate || undefined,
      });
      router.push("/assignments");
    } catch {
      setError("Failed to create assignment");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">New Assignment</h1>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Baserunning Basics"
            />
          </div>

          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
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
            <Label>Difficulty (optional)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Time Limit Per Question (optional)</Label>
            <Select value={timeLimit} onValueChange={setTimeLimit}>
              <SelectTrigger>
                <SelectValue placeholder="No time limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="20">20 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="45">45 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date (optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            onClick={handleCreate}
            className="w-full"
            size="lg"
            disabled={!title || !teamId || loading}
          >
            {loading ? "Creating..." : "Create Assignment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
