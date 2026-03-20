"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { createDonationCheckout, isDonationsEnabled } from "@/app/actions";

const AMOUNTS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
  { label: "$50", cents: 5000 },
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    isDonationsEnabled().then(setEnabled);
  }, []);

  if (enabled === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Heart className="h-10 w-10 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Donations Coming Soon</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;re setting up donations. Check back soon!
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  if (enabled === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDonate = async () => {
    const amountCents = isCustom
      ? Math.round(parseFloat(customAmount) * 100)
      : selectedAmount;

    if (!amountCents || amountCents < 100) {
      setError("Minimum donation is $1.00");
      return;
    }
    if (amountCents > 100000) {
      setError("Maximum donation is $1,000");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createDonationCheckout(amountCents, message || undefined);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      setError(result.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center space-y-2 pt-4">
        <Heart className="h-10 w-10 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Support Softball IQ</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Softball IQ is free for everyone. Your donation helps us keep it that
          way and build new features for players and coaches.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pick an amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a.cents}
                onClick={() => {
                  setSelectedAmount(a.cents);
                  setIsCustom(false);
                }}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${
                  !isCustom && selectedAmount === a.cents
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div>
            <button
              onClick={() => setIsCustom(true)}
              className={`w-full p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                isCustom
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {isCustom ? (
                <div className="flex items-center justify-center gap-1">
                  <span>$</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-20 bg-transparent text-center outline-none text-sm font-bold"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                "Custom Amount"
              )}
            </button>
          </div>

          {/* Optional message */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Leave a message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you love about Softball IQ? What should we build next?"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            onClick={handleDonate}
            disabled={loading}
            size="lg"
            className="w-full text-base"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Heart className="h-4 w-4 mr-2" />
            )}
            {loading
              ? "Redirecting..."
              : `Donate ${
                  isCustom && customAmount
                    ? `$${customAmount}`
                    : `$${(selectedAmount / 100).toFixed(0)}`
                }`}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Payments processed securely by Stripe. Donations are not tax-deductible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
