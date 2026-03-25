"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPromoCode } from "@/app/actions";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function PromoCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const result = await createPromoCode(
      code,
      description,
      maxUses ? parseInt(maxUses) : undefined,
      expiresAt ? new Date(expiresAt) : undefined
    );

    if (result.success) {
      setSuccess(`Created promo code: ${result.code}`);
      setCode("");
      setDescription("");
      setMaxUses("");
      setExpiresAt("");
      router.refresh();
    } else {
      setError(result.error || "Failed to create promo code");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Create Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            placeholder="e.g. SPRING2026"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g. Spring season promo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max Uses</Label>
            <Input
              id="maxUses"
              type="number"
              placeholder="Unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button
          onClick={handleSubmit}
          size="sm"
          disabled={saving || !code.trim()}
          className="w-full"
        >
          {saving ? "Creating..." : "Create Promo Code"}
        </Button>
      </CardContent>
    </Card>
  );
}
