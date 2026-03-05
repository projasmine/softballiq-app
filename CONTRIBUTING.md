# Contributing to SoftballIQ

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork and clone the repo
2. Follow the [Getting Started](README.md#getting-started) steps
3. Create a branch for your work: `git checkout -b my-feature`

## Environment Variables

Copy `.env.local.example` to `.env.local` and provide:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. from [Neon](https://neon.tech/)) |
| `AUTH_SECRET` | Random string for NextAuth session encryption. Generate with `npx auth secret` |

## Making Changes

- Keep PRs focused on a single change
- Follow existing code patterns (server actions in `actions.ts`, schema in `schema.ts`)
- Run `npm run lint` and `npm run build` before submitting
- Test with both coach and player roles

## Database Changes

If you modify `src/lib/db/schema.ts`:
1. Run `npm run db:push` to apply changes to your local database
2. Update `src/lib/db/seed.ts` if new seed data is needed
3. Document the change in your PR description

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if it's a UI issue
