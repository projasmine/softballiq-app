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
  updateTeamSettings,
  submitFeedback,
  redeemPromoCode,
} from "@/app/actions";
import type { TeamSettings } from "@/lib/db/schema";
import { DEFAULT_TEAM_SETTINGS } from "@/lib/db/schema";
import { categoryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Palette, MessageSquare, Heart, Settings2, Check, Ticket } from "lucide-react";
import Link from "next/link";
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
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({ ...DEFAULT_TEAM_SETTINGS });
  const [savingSettings, setSavingSettings] = useState(false);

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
          if (data.membership.settings) {
            setTeamSettings({ ...DEFAULT_TEAM_SETTINGS, ...data.membership.settings });
          }
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

  const [positionsSuccess, setPositionsSuccess] = useState(false);

  const handleSavePositions = async () => {
    setSavingPositions(true);
    setPositionsSuccess(false);
    try {
      await updatePositions(selectedPositions);
      setPositionsSuccess(true);
      setTimeout(() => setPositionsSuccess(false), 2000);
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

  const handleUpdateSettings = async (partial: Partial<TeamSettings>) => {
    setSavingSettings(true);
    // Optimistic update
    setTeamSettings((prev) => ({ ...prev, ...partial }));
    try {
      await updateTeamSettings(partial);
    } catch {
      // Revert on error — reload from server
      const data = await getDashboardData();
      if (data?.membership?.settings) {
        setTeamSettings({ ...DEFAULT_TEAM_SETTINGS, ...data.membership.settings });
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleCategoryFocus = (category: string) => {
    const current = teamSettings.categoryFocus;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    handleUpdateSettings({ categoryFocus: updated });
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
            {positionsSuccess && (
              <p className="text-sm text-green-500">Positions saved!</p>
            )}
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

      {/* Team Settings — coaches only */}
      {role === "coach" && teamId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              Team Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Questions per Rep */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Questions per Rep</Label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleUpdateSettings({ questionsPerRep: n })}
                    disabled={savingSettings}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      teamSettings.questionsPerRep === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Reset */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Leaderboard Reset</Label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "season", label: "Season" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleUpdateSettings({ leaderboardReset: option.value })}
                    disabled={savingSettings}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      teamSettings.leaderboardReset === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Focus */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category Focus</Label>
              <p className="text-xs text-muted-foreground">
                Leave all unchecked to include all categories
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["baserunning", "fielding", "hitting", "general"] as const).map(
                  (cat) => {
                    const isChecked = teamSettings.categoryFocus.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategoryFocus(cat)}
                        disabled={savingSettings}
                        className="flex items-center gap-2 cursor-pointer text-left"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </span>
                        <span className="text-sm">{categoryLabel[cat]}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promo Code — coaches without Pro */}
      {role === "coach" && teamId && plan !== "pro" && <PromoCodeCard onUpgrade={() => setPlan("pro")} />}

      {/* Pro Badge — coaches with Pro */}
      {role === "coach" && plan === "pro" && (
        <Card>
          <CardContent className="py-4 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Pro plan active</span>
            <Badge className="ml-auto text-[10px]">Pro</Badge>
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

      {/* Feedback */}
      <FeedbackCard />

      {/* Support */}
      <Button asChild variant="outline" className="w-full">
        <Link href="/donate">
          <Heart className="mr-2 h-4 w-4" />
          Support Softball IQ
        </Link>
      </Button>

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

function PromoCodeCard({ onUpgrade }: { onUpgrade: () => void }) {
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setRedeeming(true);
    setError("");
    setSuccess(false);
    const result = await redeemPromoCode(code);
    if (result.success) {
      setSuccess(true);
      setCode("");
      onUpgrade();
    } else {
      setError(result.error || "Failed to redeem code");
    }
    setRedeeming(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-1.5">
          <Ticket className="h-4 w-4" />
          Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Have a promo code? Enter it below to unlock Pro features for your team.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
          >
            {redeeming ? "..." : "Redeem"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-500">
            Pro plan activated! Enjoy all features.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackCard() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    const result = await submitFeedback(message);
    if (result.success) {
      setSent(true);
      setMessage("");
    }
    setSending(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sent ? (
          <div className="text-center py-2 space-y-2">
            <p className="text-sm text-green-500 font-medium">Thanks for your feedback!</p>
            <p className="text-xs text-muted-foreground">We read every message and use it to make Softball IQ better.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSent(false)}
            >
              Send More Feedback
            </Button>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's working? What could be better? Feature ideas?"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={sending || !message.trim()}
              className="w-full"
            >
              {sending ? "Sending..." : "Send Feedback"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
