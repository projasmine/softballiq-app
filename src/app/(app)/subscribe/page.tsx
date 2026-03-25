"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Crown } from "lucide-react";
import { createSubscriptionCheckout, isSubscriptionsEnabled } from "@/app/actions";

const PRO_FEATURES = [
  "Unlimited daily reps",
  "Configurable question sets",
  "Video uploads & review",
  "Team theme customization",
  "Category focus controls",
  "Leaderboard options",
];

export default function SubscribePage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    isSubscriptionsEnabled().then(setEnabled);
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    const result = await createSubscriptionCheckout();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      setError(result.error || "Something went wrong");
      setLoading(false);
    }
  };

  if (enabled === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Upgrade to Pro</h1>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Crown className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-lg font-semibold">Coming Soon</h2>
            <p className="text-sm text-muted-foreground">
              Pro subscriptions are not yet available. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Upgrade to Pro</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Softball IQ Pro
            </CardTitle>
            <Badge className="text-[10px]">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="text-center">
            <span className="text-3xl font-bold">$9.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-2.5">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              "Subscribe — $9.99/mo"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Cancel anytime. You&apos;ll be redirected to Stripe for secure payment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
