"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePositions, signOut, getDashboardData } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";

const POSITIONS = [
  "Pitcher",
  "Catcher",
  "First Base",
  "Second Base",
  "Third Base",
  "Shortstop",
  "Left Field",
  "Center Field",
  "Right Field",
];

export default function SettingsPage() {
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getDashboardData();
        if (data?.profile) {
          setDisplayName(data.profile.displayName);
          setRole(data.profile.role);
          setSelectedPositions((data.profile.positions as string[]) || []);
        }
      } catch {
        // Failed to load settings
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePositions(selectedPositions);
    } catch {
      // Failed to save
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-muted-foreground mt-2">Role</p>
          <p className="font-medium capitalize">{role}</p>
        </CardContent>
      </Card>

      {role === "player" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Positions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => togglePosition(pos)}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    selectedPositions.includes(pos)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
            <Button onClick={handleSave} size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save Positions"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <PushNotificationToggle />
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-red-500 hover:text-red-600"
        onClick={() => signOut()}
      >
        Sign Out
      </Button>
    </div>
  );
}
