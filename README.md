# SoftballIQ

A Next.js app that helps softball coaches and players sharpen game IQ through daily quizzes, team assignments, video reviews, and progress tracking.

## Features

- **Daily Reps** — 5 position-relevant questions per day with streak tracking
- **Assignments** — Coaches create targeted quizzes by category/difficulty
- **Video Assignments** — Share game film with team discussion
- **Question Overrides** — Coaches customize questions for their team without affecting others
- **Leaderboard & Progress** — Category breakdowns, accuracy trends, team rankings
- **Team Management** — Join codes, roster management, player stats

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [NextAuth v5](https://authjs.dev/) (JWT strategy, credentials provider)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL ([Neon](https://neon.tech/))
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/) for charts, [Lucide](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech/) free tier)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/projasmine/softballiq-app.git
   cd softballiq-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Seed the question bank (30 starter questions):
   ```bash
   npm run db:seed
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed questions into database |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (app)/           # Authenticated pages (dashboard, quiz, team, etc.)
│   ├── (public)/        # Public pages (join, landing)
│   ├── api/             # API routes (auth, questions)
│   └── actions.ts       # All server actions
├── components/
│   ├── ui/              # shadcn/ui components
│   └── ...              # Feature components
└── lib/
    ├── db/
    │   ├── schema.ts    # Drizzle table definitions
    │   └── seed.ts      # Question seed data
    ├── auth-config.ts   # NextAuth configuration
    ├── auth.ts          # Auth helper functions
    └── questions.ts     # Question override merge utility
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
