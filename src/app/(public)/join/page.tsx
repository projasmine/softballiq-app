"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { getTeamByCode } from "@/app/actions";

interface TeamData {
  id: string;
  name: string;
  players: { userId: string; displayName: string }[];
}

export default function JoinTeamPage() {
  return (
    <Suspense>
      <JoinTeamContent />
    </Suspense>
  );
}

function JoinTeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [teamCode, setTeamCode] = useState("");
  const [team, setTeam] = useState<TeamData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<{ userId: string; displayName: string } | null>(null);

  // Auto-fill and auto-lookup from URL query param
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setTeamCode(code.toUpperCase());
      // Auto-lookup the team
      setLoading(true);
      getTeamByCode(code).then((result) => {
        if (result && result.players.length > 0) {
          setTeam(result);
        } else if (result) {
          setError("No players on this team yet. Ask your coach to add you!");
        } else {
          setError("Team not found. Check the code and try again.");
        }
        setLoading(false);
      }).catch(() => {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      });
    }
  }, [searchParams]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await getTeamByCode(teamCode);
      if (!result) {
        setError("Team not found. Check the code and try again.");
      } else if (result.players.length === 0) {
        setError("No players on this team yet. Ask your coach to add you!");
      } else {
        setTeam(result);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handlePickPlayer = async (playerId: string) => {
    setSigningIn(playerId);
    setError("");

    try {
      const result = await signIn("credentials", {
        mode: "guest",
        guestId: playerId,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to sign in. Please try again.");
        setSigningIn(null);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSigningIn(null);
    }
  };

  // Step 3: Confirm your name
  if (team && selectedPlayer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{selectedPlayer.displayName}</CardTitle>
              <CardDescription className="mt-1">
                Is this you? Your daily reps and scores will be saved under this name.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              disabled={signingIn !== null}
              onClick={() => handlePickPlayer(selectedPlayer.userId)}
            >
              {signingIn ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {signingIn ? "Signing in..." : `Yes, I'm ${selectedPlayer.displayName}`}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={signingIn !== null}
              onClick={() => {
                setSelectedPlayer(null);
                setError("");
              }}
            >
              That&apos;s not me
            </Button>

            {error && (
              <p className="text-sm text-destructive text-center pt-2">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Pick your name
  if (team) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{team.name}</CardTitle>
            <CardDescription>Tap your name to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.players.map((player) => (
              <Button
                key={player.userId}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => setSelectedPlayer(player)}
              >
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium">{player.displayName}</span>
              </Button>
            ))}

            {error && (
              <p className="text-sm text-destructive text-center pt-2">{error}</p>
            )}

            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => {
                setTeam(null);
                setSelectedPlayer(null);
                setError("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Different team
            </Button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Don&apos;t see your name? Ask your coach to add you to the roster.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Enter team code
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Find Your Team</CardTitle>
          <CardDescription>
            Enter the code from your coach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamCode">Team Code</Label>
              <Input
                id="teamCode"
                placeholder="e.g. BOLT2024"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center text-lg tracking-widest font-mono"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading || teamCode.length < 4}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Find My Team
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
