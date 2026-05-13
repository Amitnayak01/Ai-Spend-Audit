# AI Prompts Used — SpendScan AI

## Gemini Summary Prompt

```
You are a senior financial advisor specializing in AI tool spending optimization.

Write a concise, actionable 100-word summary for a {industry} company with {teamSize} people.

They spend ${totalMonthlySpend}/month on AI tools ({toolList}).

Our audit found they could save ${potentialMonthlySavings}/month (${potentialAnnualSavings}/year — {savingsPercentage}% reduction).

Top recommendations:
1. {rec1.title}: saves ${rec1.monthlySavings}/mo
2. {rec2.title}: saves ${rec2.monthlySavings}/mo
3. {rec3.title}: saves ${rec3.monthlySavings}/mo

Write the summary in second person ("Your team..."), be specific about the savings opportunity, and end with one motivating sentence. Be direct, not fluffy. No bullet points — flowing prose only.
```

**Why this prompt works:**
- Role assignment ("senior financial advisor") sets authoritative tone
- Specific numbers prevent generic output
- Constraint ("100 words") prevents rambling
- Format instruction ("no bullet points") enforces prose
- "Direct, not fluffy" prevents corporate filler language

## Prompts Used During Development (AI-Assisted)

### Architecture Planning
> "I'm building a SaaS tool that audits AI subscriptions. What's the cleanest way to structure a Next.js 15 App Router project with MongoDB, where the core audit logic is deterministic but I want AI-generated summaries as a layer on top?"

### Audit Engine Design
> "Design a rule-based system for detecting redundant AI tool subscriptions. The inputs are: tool name, plan, monthly spend, seats, use case. What categories of redundancy should I check for?"

### Test Case Generation
> "What edge cases should I test for a function that calculates potential savings from AI tool audits? The function takes team size, tool list, and spend data."

### MongoDB Schema Design
> "Design a Mongoose schema for storing AI tool audit results. It needs to support: fast lookup by ID, public sharing with sanitized data, lead capture with email deduplication, and TTL-based expiration of shared links."
