# User Research — SpendScan AI

## Methodology

5 structured interviews, 30 minutes each. Screener: must manage or influence AI tool decisions for a team.

## Key Insights

### Interview 1 — Engineering Manager, 15-person startup
**Pain:** "I found out our team was on 3 different ChatGPT plans — free, Plus, and Team — because nobody told them Team was available."
**Insight:** Lack of visibility is the #1 pain, not the cost itself.

### Interview 2 — CTO, 50-person SaaS company
**Pain:** "We have Cursor for every engineer plus GitHub Copilot as a backup. I know it's redundant but I don't know who's using what."
**Insight:** Users need usage data before canceling. Just a recommendation isn't enough.

### Interview 3 — Freelance Developer
**Pain:** "I'm paying for ChatGPT Plus, Claude Pro, AND Perplexity Pro. I use all three but probably not enough to justify all three."
**Insight:** Decision fatigue is real. Users want ONE recommendation, not a list.

### Interview 4 — VP Engineering, 80-person company
**Pain:** "Our AI tool spend tripled in 6 months. Finance is asking me to justify it."
**Insight:** Shareable reports are non-negotiable for enterprise. The "CFO report" is a real use case.

### Interview 5 — Founder, 8-person company
**Pain:** "I don't know how much I should be paying for Anthropic API. Are we in the right ballpark?"
**Insight:** Industry benchmarking ("companies your size pay X on average") is a compelling differentiator.

## Patterns

1. **Visibility > Savings** — People don't know what they're paying
2. **Specific > General** — "$95 savings" beats "consider optimizing seats"
3. **Shareable reports** are table-stakes for B2B
4. **Utilization data** would dramatically increase recommendation acceptance

## Product Implications

- Build team-level view (not just individual audit)
- Add benchmark comparisons by company size/industry
- Integrate with billing APIs (Stripe, etc.) for auto-discovery
- Export to PDF for finance teams
