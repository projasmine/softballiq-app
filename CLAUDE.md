# Claude Code Instructions

## Project
SoftballIQ — a Next.js app for softball coaches and players. See README.md for full details.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- NextAuth v5 (JWT strategy, credentials provider)
- Drizzle ORM + PostgreSQL (Neon)
- Tailwind CSS + shadcn/ui (dark mode default)
- Deployed on Vercel

## Key Conventions
- All server actions live in `src/app/actions.ts`
- Database schema in `src/lib/db/schema.ts` (Drizzle ORM)
- Auth helpers: `requireUserId()` for server actions, `auth()` for data fetching
- Route groups: `(auth)` for login/signup, `(app)` for authenticated pages, `(public)` for public pages
- UI components from shadcn/ui in `src/components/ui/`
- Icons from Lucide React

## Rules
- Never expose `passwordHash` in queries — use `safeProfileColumns`
- Always verify team membership and coach role before write operations
- Use `revalidatePath()` after mutations
- Keep server actions in actions.ts, don't scatter them across files
- Use `onConflictDoNothing()` or `onConflictDoUpdate()` for upserts
- Run `npm run build` to verify changes before marking complete

## Database Changes
- Edit `src/lib/db/schema.ts`, then `npm run db:push`
- Update seed data in `src/lib/db/seed.ts` if needed
