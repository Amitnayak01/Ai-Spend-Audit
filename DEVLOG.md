# Development Log — SpendScan AI

## Session 1 — Project Foundation

**Goal:** Set up Next.js 15, TypeScript, Tailwind, and core architecture.

**Decisions made:**
- Chose App Router over Pages Router for better streaming and RSC support
- Picked `nanoid` over `uuid` for shorter, URL-safe IDs
- Used `sonner` for toasts instead of a heavier notification library
- Decided against Zustand/Jotai — localStorage + sessionStorage covers our state needs

**Problems encountered:**
- MongoDB connection pooling in Next.js requires `global.mongoose` cache pattern to survive hot-reload
- Fixed by adding the global declaration to `connect.ts`

**Time spent:** ~3 hours

---

## Session 2 — Audit Engine Design

**Goal:** Build the core business logic without AI dependencies.

**Key insight:** The audit engine must be pure functions with no side effects for testability. AI is a cosmetic layer on top.

**Redundancy pairs researched:**
- Cursor vs GitHub Copilot: both offer AI code completion in IDE
- Cursor vs Windsurf: both are agentic coding IDEs
- ChatGPT vs Claude: both are general-purpose assistants
- ChatGPT vs Gemini: Google vs OpenAI for same use case

**Confidence scoring rationale:**
- Redundancy detection: 78% (tool overlap patterns are fuzzy)
- Seat reduction: 90% (exact math, high certainty)
- API optimization: 72% (varies by use case and architecture)
- Plan downgrade: 85% (pricing data is public and reliable)

**Time spent:** ~4 hours

---

## Session 3 — Form & UI

**Goal:** Build the multi-step form with auto-save, animations, and accessibility.

**Form state approach:**
- React Hook Form for controlled inputs + validation
- useFieldArray for dynamic tool list
- useWatch for real-time auto-fill hints (expected cost calculator)
- Zod resolver for type-safe validation

**Auto-save strategy:**
- Watch all fields → debounce → localStorage.setItem
- Load on mount with `useEffect`
- Clear on successful submission

**Accessibility:**
- All inputs have `label` elements
- Error messages tied to inputs with ARIA
- Focus visible ring on all interactive elements
- Keyboard navigation through steps

**Time spent:** ~5 hours

---

## Session 4 — Results Dashboard

**Goal:** Build the results dashboard with charts, recommendations, and sharing.

**Chart library choice:** Recharts (already in React ecosystem, lighter than Chart.js for our use case)

**Recommendation UX:**
- Cards collapsed by default (show first one expanded)
- Show savings prominently in top-right
- Action items numbered for clarity
- Confidence bar for transparency

**Sharing strategy:**
- `shareId` generated at audit time (nanoid 10)
- Stored in MongoDB
- Shared URL: `/share/[shareId]`
- OG metadata generated server-side from MongoDB data

**Time spent:** ~4 hours

---

## Session 5 — Testing, Docs, CI

**Goal:** Write comprehensive tests, set up GitHub Actions CI.

**Test coverage strategy:**
- Unit tests for audit engine (25 tests across 8 suites)
- Testing utilities and edge cases
- Focus on business logic correctness, not UI rendering

**CI pipeline:**
- TypeScript check → ESLint → Tests → Build (sequential with early exit)
- Secrets passed as env vars for build step

**Time spent:** ~3 hours

---

**Total estimated development time:** ~19 hours
