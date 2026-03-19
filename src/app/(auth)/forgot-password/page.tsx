"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Need help getting back into your account?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <p className="font-medium text-sm">Contact Support</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Email us at{" "}
              <a
                href="mailto:support@softballiq.app?subject=Password Reset Request"
                className="text-primary hover:underline font-medium"
              >
                support@softballiq.app
              </a>{" "}
              with your account email and we&apos;ll help you reset your password.
            </p>
          </div>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
