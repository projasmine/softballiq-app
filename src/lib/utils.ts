import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as a friendly relative string.
 * - Today → "Today"
 * - Yesterday → "Yesterday"
 * - Within 7 days past → "3 days ago"
 * - Within 7 days future → "Due in 2 days" (or "in 2 days" if not due-style)
 * - Otherwise → "Mar 4" (no year if current year)
 */
export function formatRelativeDate(
  date: Date | string,
  style: "default" | "due" = "default"
): string {
  const d = new Date(date)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return "Today"
  if (diffDays === -1) return "Yesterday"
  if (diffDays === 1) return style === "due" ? "Due tomorrow" : "Tomorrow"

  if (diffDays < 0 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago`
  }
  if (diffDays > 0 && diffDays <= 7) {
    return style === "due" ? `Due in ${diffDays} days` : `in ${diffDays} days`
  }

  const month = d.toLocaleString("en-US", { month: "short" })
  const day = d.getDate()
  if (d.getFullYear() !== now.getFullYear()) {
    return `${month} ${day}, ${d.getFullYear()}`
  }
  return `${month} ${day}`
}

/** Shared category → display label map */
export const categoryLabel: Record<string, string> = {
  baserunning: "Base Running",
  fielding: "Fielding",
  hitting: "Hitting",
  general: "General",
}

/** Shared difficulty → display label map */
export const difficultyLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

/** Shared category → tailwind class map for colored badges */
export const categoryColorClass: Record<string, string> = {
  baserunning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  fielding: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  hitting: "bg-red-500/20 text-red-300 border-red-500/30",
  general: "bg-purple-500/20 text-purple-300 border-purple-500/30",
}
