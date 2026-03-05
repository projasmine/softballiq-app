"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createTeam,
  joinTeam,
  updatePositions,
} from "@/app/actions";

const POSITIONS = [
  "Pitcher",
  "Catcher",
  "First Base",
  "Second Base",
  "Third Base",
  "Shortstop",
  "Left Field",
  "Center Field",
  "Right Field",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role === "coach" ? "coach" : "player";
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTeam = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await createTeam(teamName);
      if (result.success) {
        setCreatedCode(result.joinCode!);
        setStep(3);
      } else {
        setError("Failed to create team");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleJoinTeam = async () => {
    setLoading(true);
    setError("");
    const result = await joinTeam(joinCode);
    if (result.success) {
      setStep(3);
    } else {
      setError(result.error || "Failed to join team");
    }
    setLoading(false);
  };

  const handlePositions = async () => {
    setLoading(true);
    await updatePositions(selectedPositions);
    router.push("/dashboard");
  };

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>
              {role === "coach" ? "Create Your Team" : "Join Your Team"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {role === "coach" ? (
              <>
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Thunder 12U"
                  />
                </div>
                <Button
                  onClick={handleCreateTeam}
                  className="w-full"
                  size="lg"
                  disabled={!teamName || loading}
                >
                  {loading ? "Creating..." : "Create Team"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Team Join Code</Label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BOLT2024"
                    maxLength={8}
                    className="text-center text-lg tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask your coach for the team code
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <Button
                  onClick={handleJoinTeam}
                  className="w-full"
                  size="lg"
                  disabled={joinCode.length < 4 || loading}
                >
                  {loading ? "Joining..." : "Join Team"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep(3);
                  }}
                >
                  Skip for now
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 3 && role === "coach" && createdCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Team Created!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Share this code with your players:
            </p>
            <div className="bg-muted rounded-xl p-6">
              <span className="text-3xl font-mono font-bold tracking-widest">
                {createdCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Players will enter this code when they sign up
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Position selection (players)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>What positions do you play?</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select all that apply — this helps us pick relevant scenarios
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => togglePosition(pos)}
                className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                  selectedPositions.includes(pos)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
          <Button
            onClick={handlePositions}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
