import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Flame,
  Users,
  Trophy,
  ShieldCheck,
  Share2,
  ClipboardList,
  BarChart3,
  Check,
} from "lucide-react";

export const metadata = {
  title: "How It Works | Softball IQ",
  description:
    "Learn how Softball IQ helps players and coaches master the game with situational quizzes, team learning, and daily streaks.",
};

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <div className="space-y-3 text-center pt-4">
        <h1 className="text-2xl font-bold tracking-tight">How It Works</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Softball IQ helps players learn the game through real situational
          quizzes — and gives coaches tools to track their team&apos;s progress.
        </p>
      </div>

      {/* For Players */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">For Players</h2>
          <Badge variant="outline" className="text-[10px]">
            Free
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-5 space-y-4">
            <Step
              icon={<Brain className="h-5 w-5 text-primary shrink-0" />}
              title="Answer real game scenarios"
              description="Each quiz puts you in a game situation — runners on base, outs, count — and asks what you'd do."
            />
            <Step
              icon={<Flame className="h-5 w-5 text-primary shrink-0" />}
              title="Build a daily streak"
              description="Complete 5 questions a day to keep your streak alive and stay sharp between practices."
            />
            <Step
              icon={<Users className="h-5 w-5 text-primary shrink-0" />}
              title="Join your team"
              description="Get a join code from your coach, link up with your team, and compete on the leaderboard."
            />
            <Step
              icon={<Trophy className="h-5 w-5 text-primary shrink-0" />}
              title="Climb the leaderboard"
              description="See how you stack up against teammates. Track your accuracy, streaks, and improvement over time."
            />
          </CardContent>
        </Card>
      </section>

      {/* For Coaches */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">For Coaches</h2>
          <Badge variant="outline" className="text-[10px]">
            Free
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-5 space-y-4">
            <Step
              icon={<ShieldCheck className="h-5 w-5 text-primary shrink-0" />}
              title="Create your team"
              description="Sign up as a coach, name your team, and pick your age group (8U-14U). Takes 30 seconds."
            />
            <Step
              icon={<Share2 className="h-5 w-5 text-primary shrink-0" />}
              title="Share the join code"
              description="Give your players a simple code to join. They'll see age-appropriate questions for your team."
            />
            <Step
              icon={<ClipboardList className="h-5 w-5 text-primary shrink-0" />}
              title="Assign timed quizzes"
              description="Create assignments by category and difficulty. Set time limits and due dates."
            />
            <Step
              icon={<BarChart3 className="h-5 w-5 text-primary shrink-0" />}
              title="Track progress"
              description="See who's completing their reps, which players are improving, and where the team needs work."
            />
          </CardContent>
        </Card>
      </section>

      {/* Getting Started */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-center">Get Started in 3 Steps</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">
                <Badge className="mr-1.5 text-[10px]">Player</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <NumberedStep n={1} text="Sign up as a player" />
              <NumberedStep n={2} text="Enter your team's join code" />
              <NumberedStep n={3} text="Start your daily reps" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">
                <Badge className="mr-1.5 text-[10px]">Coach</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <NumberedStep n={1} text="Sign up as a coach" />
              <NumberedStep n={2} text="Create your team" />
              <NumberedStep n={3} text="Share the code with players" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center space-y-4 pt-2">
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Button asChild size="lg" className="text-base">
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/play">Try Quick Play</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          Love Softball IQ?{" "}
          <Link href="/donate" className="text-primary hover:underline">
            Support us with a donation
          </Link>
        </p>
      </section>

      {/* Legal */}
      <footer className="border-t border-border pt-8 space-y-6 text-xs text-muted-foreground">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Privacy Policy</h3>
          <div className="space-y-2 leading-relaxed">
            <p>
              Softball IQ (&quot;we,&quot; &quot;our,&quot; or &quot;the app&quot;) is committed to
              protecting the privacy of our users, including minors. We collect only the
              information necessary to provide our services: email address, display name,
              team membership, and quiz performance data.
            </p>
            <p>
              We do not sell, rent, or share personal information with third parties for
              marketing purposes. Quiz performance data is used solely to provide
              leaderboards, progress tracking, and team analytics within the app.
            </p>
            <p>
              Accounts for users under 13 should be created with parental or guardian
              consent. Coaches and parents are responsible for ensuring appropriate use by
              minors on their teams. We comply with applicable provisions of the
              Children&apos;s Online Privacy Protection Act (COPPA).
            </p>
            <p>
              Passwords are encrypted and stored securely. We do not store payment
              information directly — all future payment processing will be handled by
              trusted third-party providers.
            </p>
            <p>
              You may request deletion of your account and associated data at any time by
              contacting us. We will process deletion requests within 30 days.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Terms of Use</h3>
          <div className="space-y-2 leading-relaxed">
            <p>
              By using Softball IQ, you agree to these terms. The app is provided
              &quot;as is&quot; without warranties of any kind. We reserve the right to
              modify, suspend, or discontinue any part of the service at any time.
            </p>
            <p>
              User-generated content (such as custom team questions) remains the
              intellectual property of the creator. All other content, including quiz
              questions, explanations, illustrations, and software, is the property of
              Softball IQ and may not be reproduced or distributed without permission.
            </p>
            <p>
              Free accounts may be subject to usage limits. Premium features and pricing
              are subject to change. We will provide reasonable notice before implementing
              changes that affect existing paid subscriptions.
            </p>
          </div>
        </div>

        <div className="text-center pt-2 pb-4 space-y-1">
          <p>&copy; {new Date().getFullYear()} Softball IQ. All rights reserved.</p>
          <p>
            Questions or concerns?{" "}
            <a
              href="mailto:support@softballiq.app"
              className="text-primary hover:underline"
            >
              support@softballiq.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      {icon}
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function NumberedStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
        {n}
      </span>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
      <p className="text-xs">{text}</p>
    </div>
  );
}
