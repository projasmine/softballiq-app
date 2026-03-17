import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Flame, Users, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-8">
        {/* Brand */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Softball IQ
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">
              12U Rules
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Master the game. Know the play.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Button asChild size="lg" className="text-base">
            <Link href="/play">Play Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/join">Join a Team</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Coach?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="p-4 rounded-xl bg-card border border-border text-left space-y-1.5">
            <Brain className="h-5 w-5 text-primary" />
            <p className="font-medium text-sm">Situational Quizzes</p>
            <p className="text-xs text-muted-foreground">
              Real game scenarios with field diagrams
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-left space-y-1.5">
            <Flame className="h-5 w-5 text-primary" />
            <p className="font-medium text-sm">Daily Streaks</p>
            <p className="text-xs text-muted-foreground">
              5 questions a day to stay sharp
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-left space-y-1.5">
            <Users className="h-5 w-5 text-primary" />
            <p className="font-medium text-sm">Team Learning</p>
            <p className="text-xs text-muted-foreground">
              Coaches assign, players compete
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-left space-y-1.5">
            <Trophy className="h-5 w-5 text-primary" />
            <p className="font-medium text-sm">Leaderboard</p>
            <p className="text-xs text-muted-foreground">
              Track progress and rank up
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Built for girls&apos; softball
        </p>
      </div>
    </div>
  );
}
