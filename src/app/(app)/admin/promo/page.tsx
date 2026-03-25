import { getPromoCodes } from "@/app/actions";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import { PromoCodeForm } from "./promo-form";
import { PromoCodeList } from "./promo-list";

export default async function AdminPromoPage() {
  const codes = await getPromoCodes();

  if (codes === null) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Ticket className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Promo Codes</h1>
        <Badge variant="secondary" className="ml-auto">
          {codes.length}
        </Badge>
      </div>

      <PromoCodeForm />

      {codes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No promo codes created yet.
          </CardContent>
        </Card>
      ) : (
        <PromoCodeList codes={codes} />
      )}
    </div>
  );
}
