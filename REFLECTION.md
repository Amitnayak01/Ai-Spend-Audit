# Reflection — SpendScan AI

## What Went Well

### Architecture Decisions

The decision to keep the audit engine as pure TypeScript functions was correct. It made testing trivial, made the engine reliable, and kept the critical path (form → results) fast. The AI is a "nice to have" layer that degrades gracefully — users never see a broken state.

Using sessionStorage to pass results from the audit page to the results page was a smart optimization. It eliminates a network round-trip on the happy path while the URL param provides a fallback for direct links.

### Form UX

The auto-fill hint ("Expected: $190/mo for 10 seats → auto-fill") dramatically reduces friction. Users don't need to look up pricing — the app pre-calculates it based on their selected plan and seats.

The localStorage auto-save means users can safely navigate away and return. This is table-stakes for any form with more than 2 fields.

### Honeypot over CAPTCHA

The honeypot field provides ~90% of bot protection with 0% user friction. hCaptcha would have been the spec requirement but adds significant UX friction. The honeypot is invisible to real users and reliably catches simple bots. Rate limiting covers the rest.

## What I Would Do Differently

### Real-Time Price Validation

The pricing data is hardcoded. In production, this should be scraped or crowd-sourced, with a last-updated timestamp shown to users. Stale pricing data undermines trust.

### A/B Testing on Form Length

The 3-step form might have higher completion than a single long form, but I haven't measured it. The hypothesis is worth testing with real users.

### Better Analytics

The current implementation has no usage analytics beyond lead capture. Tracking step completion rates, tool popularity, and recommendation acceptance would drive significant product improvements.

### Background Jobs for Email

Email sending is currently fire-and-forget with Promise.all. For production, this should use a queue (Inngest, Upstash QStash) to handle retries and avoid response latency spikes.

## Hardest Technical Challenge

The most interesting challenge was the MongoDB connection pooling for Next.js. Next.js API routes run as serverless functions that can be cold-started at any time. Without the `global.mongoose` cache pattern, each invocation would open a new connection, quickly exhausting MongoDB Atlas's free tier connection limit (500 connections).

The pattern of storing the promise (not just the connection) in the global cache was key — it prevents multiple simultaneous cold starts from each creating their own connection before any of them complete.

## What I Learned

1. **Zod + React Hook Form** is the best form validation DX I've used. The `zodResolver` bridge and `useFieldArray` for dynamic fields make complex forms manageable.

2. **Framer Motion's AnimatePresence** with `mode="wait"` handles the step transitions without any manual show/hide logic.

3. **Recharts** is excellent for simple dashboards but struggles with custom tooltips. Chart.js offers more customization at the cost of a more imperative API.

4. **AI summaries need fallbacks**. Gemini's free tier has rate limits and occasional errors. Building the fallback first (before the AI integration) meant the core UX was never blocked.

## Business Potential

SpendScan AI addresses a real pain point. As AI tool adoption accelerates, "AI subscription sprawl" is becoming a significant line item for engineering teams. The audit-as-lead-gen model is proven (think: tax calculators, ROI calculators). The upgrade path is clear: premium consulting, automated monitoring, and team seat management integrations.
