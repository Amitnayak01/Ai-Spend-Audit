# SpendScan AI — AI Spend Audit SaaS

> Find hidden savings in your team's AI tool stack. Free, instant, and actionable.

[![CI](https://github.com/your-org/ai-spend-audit/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/ai-spend-audit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What It Does

SpendScan AI audits your team's AI subscriptions (Cursor, GitHub Copilot, ChatGPT, Claude, etc.) and identifies:

- **Redundant tools** — paying for Cursor AND GitHub Copilot
- **Unused seats** — 10 Copilot licenses for a 6-person team
- **Wrong plans** — Enterprise plan when Business suffices
- **API overspend** — unoptimized token usage burning cash

Average finding: **$847/month** in savings per audit.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes, MongoDB Atlas, Mongoose |
| Forms | React Hook Form + Zod |
| AI | Google Gemini API (free tier) + fallback |
| Email | Resend (free tier, 100/day) |
| Deployment | Vercel (free tier) |
| Testing | Vitest, React Testing Library |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/ai-spend-audit.git
cd ai-spend-audit
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values (see `.env.example` for all keys):

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Free tier cluster |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `RESEND_API_KEY` | [Resend](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Your verified domain in Resend |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` in dev |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── audit/page.tsx       # Multi-step audit form
│   ├── results/page.tsx     # Results dashboard
│   ├── share/[id]/          # Shareable public reports
│   └── api/
│       ├── audit/route.ts   # Main audit endpoint
│       └── share/route.ts   # Share lookup endpoint
├── components/              # Reusable UI components
├── lib/
│   ├── audit-engine/        # Pure business logic (no AI)
│   │   ├── index.ts         # Core audit runner
│   │   └── tool-data.ts     # Pricing & metadata
│   ├── ai/summary.ts        # Gemini AI summary generation
│   ├── db/                  # MongoDB connection & models
│   └── email/               # Resend email templates
├── types/index.ts           # All TypeScript types
└── ...

tests/
└── audit-engine.test.ts     # 25+ unit tests
```

---

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI)
npm run type-check   # TypeScript check
npm run lint         # ESLint
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel Dashboard
4. Deploy

The project is optimized for Vercel's Edge Network and uses ISR for shared reports.

---

## Supported AI Tools

Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Google Gemini, Windsurf, v0 by Vercel, Perplexity, Midjourney, and any custom tool.

---

## Contributing

PRs welcome. Please run `npm run test:run && npm run type-check` before submitting.

---

## License

MIT © 2025 SpendScan AI / Credex Assignment
