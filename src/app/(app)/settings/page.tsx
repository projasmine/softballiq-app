"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updatePositions,
  updateProfile,
  signOut,
  getDashboardData,
  deleteTeam,
  updateTeamTheme,
} from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Palette } from "lucide-react";
import { useRouter } from "next/navigation";

const THEMES = [
  { id: "default", label: "Default", swatch: "#c9a227" },
  { id: "crimson", label: "Crimson", swatch: "#dc2626" },
  { id: "ocean", label: "Ocean", swatch: "#3b82f6" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "purple", label: "Purple", swatch: "#8b5cf6" },
  { id: "sunset", label: "Sunset", swatch: "#f97316" },
  { id: "midnight", label: "Midnight", swatch: "#6366f1" },
  { id: "gold", label: "Gold", swatch: "#eab308" },
];

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
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPositions, setSavingPositions] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [plan, setPlan] = useState("free");
  const [currentTheme, setCurrentTheme] = useState("default");
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getDashboardData();
        if (data?.profile) {
          setDisplayName(data.profile.displayName);
          setEmail(data.profile.email);
          setRole(data.profile.role);
          setPlan(data.profile.plan);
          setSelectedPositions((data.profile.positions as string[]) || []);
        }
        if (data?.membership) {
          setTeamName(data.membership.teamName);
          setTeamId(data.membership.teamId);
          setCurrentTheme(data.membership.theme ?? "default");
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

  const handleSavePositions = async () => {
    setSavingPositions(true);
    try {
      await updatePositions(selectedPositions);
    } catch {
      // Failed to save
    } finally {
      setSavingPositions(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      const result = await updateProfile({ displayName, email });
      if (result.success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 2000);
      } else {
        setProfileError(result.error || "Failed to update profile");
      }
    } catch {
      setProfileError("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId) return;
    setDeleting(true);
    try {
      await deleteTeam(teamId);
      router.push("/dashboard");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
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

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <p className="text-sm font-medium capitalize">{role}</p>
          </div>
          {profileError && (
            <p className="text-sm text-red-500">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="text-sm text-green-500">Profile updated!</p>
          )}
          <Button onClick={handleSaveProfile} size="sm" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Positions — players only */}
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
            <Button onClick={handleSavePositions} size="sm" disabled={savingPositions}>
              {savingPositions ? "Saving..." : "Save Positions"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Theme — coaches with pro plan */}
      {role === "coach" && plan === "pro" && teamId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Palette className="h-4 w-4" />
                Team Theme
              </CardTitle>
              <Badge className="text-[10px]">Pro</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={async () => {
                    setSavingTheme(true);
                    setCurrentTheme(t.id);
                    await updateTeamTheme(t.id);
                    setSavingTheme(false);
                    window.location.reload();
                  }}
                  className={`p-2.5 rounded-lg border-2 text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                    currentTheme === t.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  disabled={savingTheme}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ backgroundColor: t.swatch }}
                  />
                  <span className="text-[10px]">{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Team — coaches only */}
      {role === "coach" && teamId && (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-base text-red-500">Delete Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!confirmDelete ? (
              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-600 border-red-500/30 hover:border-red-500/50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Team
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-400">
                  This will permanently delete <strong>{teamName}</strong> and all its assignments, scores, and player data. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteTeam}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Yes, Delete Team"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
