"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flame,
  Trophy,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const playerNav = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/daily-rep", icon: Flame, label: "Daily Rep" },
  { href: "/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const coachNav = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/team", icon: Users, label: "Team" },
  { href: "/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav({ role }: { role: "player" | "coach" }) {
  const pathname = usePathname();
  const nav = role === "coach" ? coachNav : playerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 px-3 min-w-[56px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  "text-[10px]",
                  active ? "font-semibold" : "font-normal"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
