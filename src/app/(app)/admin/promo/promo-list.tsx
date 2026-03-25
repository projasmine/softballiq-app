"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deactivatePromoCode } from "@/app/actions";
import { useRouter } from "next/navigation";

type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  grantsPro: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: Date | null;
  createdAt: Date;
};

function getStatus(code: PromoCode): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (code.maxUses !== null && code.currentUses >= code.maxUses) {
    return { label: "Maxed Out", variant: "destructive" };
  }
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return { label: "Expired", variant: "destructive" };
  }
  return { label: "Active", variant: "default" };
}

export function PromoCodeList({ codes }: { codes: PromoCode[] }) {
  const router = useRouter();
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const handleDeactivate = async (codeId: string) => {
    setDeactivating(codeId);
    await deactivatePromoCode(codeId);
    router.refresh();
    setDeactivating(null);
  };

  return (
    <div className="space-y-3">
      {codes.map((code) => {
        const status = getStatus(code);
        const isActive = status.label === "Active";

        return (
          <Card key={code.id}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <code className="font-mono font-bold text-sm text-primary">
                  {code.code}
                </code>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              {code.description && (
                <p className="text-sm text-muted-foreground">
                  {code.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Uses: {code.currentUses}
                  {code.maxUses !== null ? ` / ${code.maxUses}` : " / unlimited"}
                </span>
                {code.expiresAt && (
                  <span>
                    Expires: {new Date(code.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-600 border-red-500/30 hover:border-red-500/50"
                  onClick={() => handleDeactivate(code.id)}
                  disabled={deactivating === code.id}
                >
                  {deactivating === code.id ? "Deactivating..." : "Deactivate"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
