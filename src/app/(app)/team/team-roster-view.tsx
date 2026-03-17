"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Target, Flame, ChevronRight, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { addPlayerToRoster } from "@/app/actions";
import { useRouter } from "next/navigation";

interface TeamRosterViewProps {
  members: {
    userId: string;
    displayName: string;
    role: string;
    positions: unknown;
    totalScore: number;
    totalQuestions: number;
    accuracy: number;
    currentStreak: number;
    quizCount: number;
  }[];
  joinCode: string;
}

export function TeamRosterView({ members, joinCode }: TeamRosterViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    setAdding(true);
    setError("");
    try {
      await addPlayerToRoster(playerName);
      setPlayerName("");
      setShowAddPlayer(false);
      router.refresh();
    } catch {
      setError("Failed to add player");
    }
    setAdding(false);
  };

  const players = members.filter((m) => m.role === "player");
  const coaches = members.filter((m) => m.role === "coach");

  return (
    <div className="space-y-4">
      {/* Join code */}
      <Card>
        <CardContent className="pt-3 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Join Code</p>
            <p className="font-mono font-bold tracking-widest">{joinCode}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {/* Coaches */}
      {coaches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Coaches ({coaches.length})
          </h3>
          {coaches.map((coach) => (
            <Card key={coach.userId}>
              <CardContent className="pt-3 pb-3">
                <p className="font-medium">{coach.displayName}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Players */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Players ({players.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddPlayer(!showAddPlayer)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Player
          </Button>
        </div>

        {/* Add Player Form */}
        {showAddPlayer && (
          <Card>
            <CardContent className="pt-3 pb-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Player name"
                  onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                />
                <Button onClick={handleAddPlayer} disabled={!playerName.trim() || adding} size="sm">
                  {adding ? "..." : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </CardContent>
          </Card>
        )}

        {players.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                No players yet. Add players above so they can find their name when joining!
              </p>
            </CardContent>
          </Card>
        ) : (
          players.map((player) => (
            <Link key={player.userId} href={`/team/${player.userId}`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {player.displayName}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {player.accuracy}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {player.currentStreak}d
                      </span>
                      <span>{player.quizCount} quizzes</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
