import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Brain, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Fast Pitch <span className="text-primary">IQ</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Build your softball game IQ, one play at a time
          </p>
        </div>

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
        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="p-4 rounded-xl bg-card border border-border text-center space-y-2">
            <Brain className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold text-sm">Situational Quizzes</h3>
            <p className="text-xs text-muted-foreground">
              Real game scenarios with visual field diagrams
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center space-y-2">
            <Flame className="h-8 w-8 mx-auto text-orange-500" />
            <h3 className="font-semibold text-sm">Daily Streaks</h3>
            <p className="text-xs text-muted-foreground">
              5 questions a day keeps the errors away
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-blue-500" />
            <h3 className="font-semibold text-sm">Team Learning</h3>
            <p className="text-xs text-muted-foreground">
              Coaches assign, players compete together
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center space-y-2">
            <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
            <h3 className="font-semibold text-sm">Leaderboard</h3>
            <p className="text-xs text-muted-foreground">
              Track progress and rank against teammates
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Built for 12U girls&apos; fastpitch softball
        </p>
      </div>
    </div>
  );
}
