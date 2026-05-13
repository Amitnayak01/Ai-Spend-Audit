# Architecture — SpendScan AI

## System Overview

```
Browser → Next.js App Router → API Routes → MongoDB Atlas
                                    ↓
                               Audit Engine (pure logic)
                                    ↓
                               Gemini AI (summary only)
                                    ↓
                               Resend Email
```

---

## Frontend Architecture

### Next.js 15 App Router

All pages use the App Router with Server Components where possible and Client Components for interactive UI.

**Pages:**
- `/` — Landing page (Server Component, statically generated)
- `/audit` — Multi-step form (Client Component, needs localStorage)
- `/results` — Dashboard (Client Component, reads sessionStorage)
- `/share/[id]` — Public shared report (Server Component with dynamic OG metadata)

### State Management

No global state library. We use:
- `React Hook Form` for form state
- `localStorage` for draft persistence across sessions
- `sessionStorage` for passing audit results to results page
- URL params (`?id=xxx`) for result lookup fallback

### Data Flow

```
User fills form
    → React Hook Form validates (Zod schema)
    → localStorage.setItem (auto-save draft)
    → POST /api/audit
    → sessionStorage.setItem (result cache)
    → router.push('/results?id=xxx')
    → Results page reads sessionStorage
    → Falls back to GET /api/audit?id=xxx if empty
```

---

## Audit Engine

The audit engine (`src/lib/audit-engine/index.ts`) is **pure TypeScript with no external dependencies**. It receives `AuditFormData` and returns `AuditResult` synchronously.

### Detection Pipeline

1. **Redundancy Detection** — Cross-references tool pairs against `REDUNDANT_PAIRS` list. Flags when 2+ tools in the same redundancy group are active.

2. **API Overspend** — Flags pay-as-you-go tools spending >$200/month and recommends 30% reduction through caching/optimization.

3. **Seat Utilization** — Compares `seats` against `teamSize`. Generates `reduce-seats` recommendation for excess licenses.

4. **Plan Optimization** — Rule-based checks for plan mismatches (e.g., Enterprise plan for small teams).

5. **Tool Switching** — Suggests lower-cost alternatives when clear value gaps exist.

6. **Bundle Recommendations** — Detects 2+ paid general AI assistants and recommends consolidation.

### Why No AI in the Engine?

The business logic must be deterministic and testable. AI is used only for the narrative summary (cosmetic layer on top of hardcoded findings). This ensures:
- Reproducible test results
- No API dependency for core functionality
- Instant response (no AI latency on the critical path)

---

## API Design

### `POST /api/audit`

```
Request:  AuditFormData (validated with Zod)
Response: { id, shareId, summary, recommendations, aiSummary }

Pipeline:
1. Rate limit check (IP-based, 10 req/min)
2. Honeypot check (bot detection)
3. Zod validation
4. runAuditEngine() — synchronous
5. generateAISummary() — async with 10s timeout + fallback
6. MongoDB: save audit + upsert lead
7. Resend: send emails (non-blocking, Promise.all)
8. Return sanitized result (no email in response)
```

### `GET /api/share?shareId=xxx`

Returns a sanitized version of the audit for public viewing. Does not expose email or PII.

---

## Database Schema

### `audits` Collection

```typescript
{
  id: string          // nanoid(12), unique
  formData: {
    teamSize, industry, companyName,
    tools: ToolEntry[],
    email,           // lowercase
    role, firstName, lastName
  }
  summary: { totalMonthlySpend, potentialMonthlySavings, ... }
  recommendations: Recommendation[]
  aiSummary: string
  shareId: string    // nanoid(10)
  createdAt, updatedAt
}

Indexes: id (unique), shareId (sparse), formData.email, createdAt
```

### `leads` Collection

```typescript
{
  email: string      // unique, lowercase
  firstName, lastName, company, role
  teamSize: number
  totalMonthlySpend, potentialSavings: number
  auditId: string
  source: string
  createdAt, updatedAt
}

Indexes: email (unique), auditId, createdAt
```

### `sharedReports` Collection

```typescript
{
  shareId: string    // unique
  auditId: string
  expiresAt: Date    // TTL index — auto-deletes after 30 days
  viewCount: number
  sanitizedData: object
}
```

---

## Security

| Concern | Mitigation |
|---|---|
| Bot submissions | Honeypot field (`website` input, CSS hidden) |
| API abuse | IP-based rate limiting (10 req/min) |
| PII in responses | Email stripped from all GET responses |
| XSS | Next.js default escaping + CSP headers |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| MongoDB injection | Mongoose schema validation |
| Mass assignment | Zod schema whitelist on inputs |

---

## Performance

- **Audit engine**: <1ms (pure JS, no I/O)
- **AI summary**: <10s with 10s timeout (non-blocking on email)
- **MongoDB**: Connection pooling (max 10), reuse across requests
- **Images**: next/image with CDN optimization
- **CSS**: Tailwind purge removes unused styles
- **Bundle**: Dynamic imports for heavy chart components
- **Caching**: Shared report pages use ISR (1hr revalidation)

---

## AI Integration

### Gemini API (Primary)

Model: `gemini-1.5-flash` (free tier, 15 RPM)

The prompt is carefully crafted to return exactly ~100 words in flowing prose (no bullets). Temperature 0.7 for natural language.

### Fallback

If Gemini fails (timeout, rate limit, invalid key), `generateFallbackSummary()` constructs a deterministic summary from the audit data. Users never see an error — they always get a summary.

---

## Deployment Checklist

- [ ] MongoDB Atlas: Create free M0 cluster
- [ ] MongoDB Atlas: Whitelist `0.0.0.0/0` (Vercel IPs dynamic)
- [ ] Resend: Verify sending domain
- [ ] Google AI Studio: Create Gemini API key
- [ ] Vercel: Add all env vars
- [ ] Vercel: Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Test: Submit a full audit end-to-end
- [ ] Test: Check shared report URL
- [ ] Test: Verify email delivery
