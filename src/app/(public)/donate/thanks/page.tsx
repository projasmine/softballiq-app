"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, CheckCircle2 } from "lucide-react";
import { completeDonation } from "@/app/actions";

export default function DonationThanksPage() {
  return (
    <Suspense>
      <ThanksContent />
    </Suspense>
  );
}

function ThanksContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (sessionId) {
      completeDonation(sessionId).then((result) => {
        if (result.success) setConfirmed(true);
      });
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="relative">
        <Heart className="h-16 w-16 text-primary" />
        {confirmed && (
          <CheckCircle2 className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground max-w-sm">
          Your support means the world to us. It helps us keep Softball IQ
          free and build new features for players and coaches.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="pt-4 text-center space-y-2">
          <p className="text-sm font-medium">Want to help even more?</p>
          <p className="text-xs text-muted-foreground">
            Share Softball IQ with other coaches and teams in your league!
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild>
          <Link href="/play">Play Now</Link>
        </Button>
      </div>
    </div>
  );
}
