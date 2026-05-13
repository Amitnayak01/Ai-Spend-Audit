// ============================================================
// AUDIT ENGINE — Pure business logic, no AI dependencies
// All recommendations based on hardcoded pricing data
// ============================================================

import type {
  AuditFormData,
  AuditResult,
  Recommendation,
  ToolEntry,
  AITool,
  SeverityLevel,
} from "@/types";
import { TOOL_METADATA } from "./tool-data";
import { nanoid } from "nanoid";

// ============================================================
// REDUNDANCY DETECTION
// ============================================================

const REDUNDANT_PAIRS: Array<{ tools: AITool[]; reason: string }> = [
  {
    tools: ["cursor", "windsurf"],
    reason: "Both are AI coding assistants with overlapping capabilities",
  },
  {
    tools: ["cursor", "github-copilot"],
    reason: "Cursor includes Copilot-like functionality; both overlap significantly",
  },
  {
    tools: ["windsurf", "github-copilot"],
    reason: "Both provide AI code completion in your IDE",
  },
  {
    tools: ["chatgpt", "claude"],
    reason: "Both are general-purpose AI assistants; one may suffice for your team",
  },
  {
    tools: ["chatgpt", "gemini"],
    reason: "Overlapping general AI assistant use cases",
  },
  {
    tools: ["claude", "gemini"],
    reason: "Both serve similar writing and reasoning tasks",
  },
  {
    tools: ["anthropic-api", "openai-api"],
    reason: "Dual API usage may indicate unconsolidated integrations",
  },
  {
    tools: ["v0", "cursor"],
    reason: "v0 generates UI code; Cursor edits it — consider if both are needed",
  },
];

// ============================================================
// SEAT UTILIZATION THRESHOLDS
// ============================================================

const UTILIZATION_WARNING = 0.7; // 70% seat utilization is the warning threshold
const OVERSPEND_THRESHOLD = 200; // $200+/mo per tool is worth scrutinizing

// ============================================================
// PLAN OPTIMIZATION RULES
// ============================================================

interface PlanOptimization {
  tool: AITool;
  condition: (entry: ToolEntry, teamSize: number) => boolean;
  recommendation: Partial<Recommendation>;
}

const PLAN_OPTIMIZATIONS: PlanOptimization[] = [
  // GitHub Copilot: Enterprise is overkill for small teams
  {
    tool: "github-copilot",
    condition: (e, teamSize) => e.plan === "enterprise" && teamSize < 50,
    recommendation: {
      type: "downgrade",
      title: "Downgrade Copilot Enterprise → Business",
      description:
        "Enterprise plan includes admin controls you likely don't need for teams under 50. Business plan covers all core AI features.",
      reason:
        "GitHub Copilot Enterprise ($39/seat) offers audit logs and IP indemnification — primarily needed by companies >50 people. Business plan ($19/seat) is sufficient.",
    },
  },
  // Claude Enterprise: overkill for small teams
  {
    tool: "claude",
    condition: (e, teamSize) => e.plan === "enterprise" && teamSize < 25,
    recommendation: {
      type: "downgrade",
      title: "Downgrade Claude Enterprise → Team",
      description:
        "Team plan provides shared workspaces and higher limits at a fraction of the cost for teams under 25.",
      reason:
        "Claude Enterprise is designed for large organizations. Team plan ($25/seat) gives you shared Projects and 5× more usage than Pro.",
    },
  },
  // ChatGPT: Team vs individual
  {
    tool: "chatgpt",
    condition: (e) => e.plan === "pro" && e.seats > 3,
    recommendation: {
      type: "downgrade",
      title: "Switch ChatGPT Individual → Team Plan",
      description:
        "ChatGPT Team ($25/seat) includes shared workspaces and higher message limits — better value when 4+ people are on individual plans.",
      reason:
        "Multiple individual Plus subscriptions ($20/seat each) cost the same or more than ChatGPT Team ($25/seat) which adds collaboration features.",
    },
  },
  // Cursor Pro for large teams → Business
  {
    tool: "cursor",
    condition: (e) => e.plan === "pro" && e.seats > 5,
    recommendation: {
      type: "downgrade",
      title: "Upgrade Cursor Individual → Business Plan",
      description:
        "Cursor Business ($40/seat) enforces privacy mode and centralized billing — critical for companies with 5+ engineers.",
      reason:
        "Multiple individual Pro licenses lack admin controls and code privacy guarantees. Business plan protects your IP.",
    },
  },
];

// ============================================================
// MAIN AUDIT FUNCTION
// ============================================================

export function runAuditEngine(formData: AuditFormData): AuditResult {
  const { tools, teamSize } = formData;
  const recommendations: Recommendation[] = [];

  // Calculate totals
  const totalMonthlySpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;

  // ── 1. REDUNDANCY DETECTION ──────────────────────────────
  const toolIds = tools.map((t) => t.tool);
  const redundantTools: string[] = [];

  for (const pair of REDUNDANT_PAIRS) {
    const matchingTools = pair.tools.filter((p) => toolIds.includes(p));
    if (matchingTools.length >= 2) {
      const toolEntries = tools.filter((t) => matchingTools.includes(t.tool));
      const cheaperTool = toolEntries.sort(
        (a, b) => a.monthlySpend - b.monthlySpend
      )[0];
      const expensiveTool = toolEntries.sort(
        (a, b) => b.monthlySpend - a.monthlySpend
      )[0];

      if (cheaperTool && expensiveTool && cheaperTool.id !== expensiveTool.id) {
        const savings = expensiveTool.monthlySpend;
        redundantTools.push(TOOL_METADATA[expensiveTool.tool]?.name || expensiveTool.tool);

        recommendations.push({
          id: nanoid(8),
          toolId: expensiveTool.id,
          tool: expensiveTool.tool,
          type: "eliminate",
          title: `Eliminate redundant: ${TOOL_METADATA[expensiveTool.tool]?.name}`,
          description: pair.reason,
          currentCost: expensiveTool.monthlySpend,
          recommendedCost: 0,
          monthlySavings: savings,
          annualSavings: savings * 12,
          confidence: 78,
          severity: savings > 100 ? "high" : "medium",
          reason: pair.reason,
          actionItems: [
            `Consolidate workflows onto ${TOOL_METADATA[cheaperTool.tool]?.name}`,
            `Cancel ${TOOL_METADATA[expensiveTool.tool]?.name} subscription`,
            "Migrate any team workflows within 30 days",
            "Survey team on missing features before canceling",
          ],
          alternativeTool: TOOL_METADATA[cheaperTool.tool]?.name,
        });
      }
    }
  }

  // ── 2. OVERSPEND DETECTION ───────────────────────────────
  for (const entry of tools) {
    const metadata = TOOL_METADATA[entry.tool];
    if (!metadata) continue;

    const currentPlan = metadata.plans.find((p) => p.id === entry.plan);
    if (!currentPlan) continue;

    const expectedCost = currentPlan.monthlyPricePerSeat * entry.seats;
    const actualCost = entry.monthlySpend;

    // Check if spending significantly more than expected (API usage spike)
    if (
      entry.plan === "pay-as-you-go" &&
      actualCost > OVERSPEND_THRESHOLD
    ) {
      const suggestedCap = Math.round(actualCost * 0.7);
      const savings = actualCost - suggestedCap;

      recommendations.push({
        id: nanoid(8),
        toolId: entry.id,
        tool: entry.tool,
        type: "optimize",
        title: `Set spending cap on ${metadata.name}`,
        description: `Your ${metadata.name} API spend of $${actualCost}/mo is high. Implement caching and request optimization to cut costs by ~30%.`,
        currentCost: actualCost,
        recommendedCost: suggestedCap,
        monthlySavings: savings,
        annualSavings: savings * 12,
        confidence: 72,
        severity: actualCost > 500 ? "critical" : "high",
        reason:
          "Pay-as-you-go API costs can be reduced 20-40% through response caching, prompt optimization, and model tier selection.",
        actionItems: [
          "Implement semantic response caching (Redis/Upstash)",
          "Switch to claude-haiku or gpt-4o-mini for simpler tasks",
          "Add spending alerts at 80% of monthly budget",
          "Review token usage per API call",
          "Batch similar requests when possible",
        ],
      });
    }

    // Seat utilization check
    if (entry.seats > teamSize && teamSize > 0) {
      const excessSeats = entry.seats - teamSize;
      const costPerSeat = currentPlan.monthlyPricePerSeat;
      const savings = excessSeats * costPerSeat;

      if (savings > 0) {
        recommendations.push({
          id: nanoid(8),
          toolId: entry.id,
          tool: entry.tool,
          type: "reduce-seats",
          title: `Remove ${excessSeats} unused ${metadata.name} seats`,
          description: `You have ${entry.seats} seats for ${metadata.name} but only ${teamSize} team members. Reduce to ${teamSize} seats.`,
          currentCost: entry.monthlySpend,
          recommendedCost: entry.monthlySpend - savings,
          monthlySavings: savings,
          annualSavings: savings * 12,
          confidence: 90,
          severity: savings > 50 ? "high" : "medium",
          reason: `${excessSeats} seats are being paid for but have no corresponding team members to use them.`,
          actionItems: [
            `Audit who is actively using ${metadata.name}`,
            `Remove ${excessSeats} inactive licenses`,
            "Set up quarterly seat utilization reviews",
          ],
        });
      }
    }
  }

  // ── 3. PLAN OPTIMIZATION RULES ───────────────────────────
  for (const rule of PLAN_OPTIMIZATIONS) {
    const matchingEntry = tools.find((t) => t.tool === rule.tool);
    if (!matchingEntry) continue;

    if (rule.condition(matchingEntry, teamSize)) {
      const metadata = TOOL_METADATA[rule.tool];
      // Find cheaper plan price
      const plans = metadata?.plans ?? [];
      const currentPlanPrice =
        plans.find((p) => p.id === matchingEntry.plan)?.monthlyPricePerSeat ?? 0;
      const cheaperPlan = plans
        .filter((p) => p.monthlyPricePerSeat < currentPlanPrice)
        .sort((a, b) => b.monthlyPricePerSeat - a.monthlyPricePerSeat)[0];

      if (cheaperPlan) {
        const newCost = cheaperPlan.monthlyPricePerSeat * matchingEntry.seats;
        const savings = matchingEntry.monthlySpend - newCost;

        if (savings > 0) {
          recommendations.push({
            id: nanoid(8),
            toolId: matchingEntry.id,
            tool: matchingEntry.tool,
            type: "downgrade",
            currentCost: matchingEntry.monthlySpend,
            recommendedCost: newCost,
            monthlySavings: savings,
            annualSavings: savings * 12,
            confidence: 85,
            severity: savings > 100 ? "high" : "medium",
            actionItems: [
              `Log in to ${metadata?.name} settings`,
              `Switch to ${cheaperPlan.name} plan`,
              "Verify no critical features are lost",
              "Notify team of any changes",
            ],
            ...rule.recommendation,
          } as Recommendation);
        }
      }
    }
  }

  // ── 4. TOOL SWITCH RECOMMENDATIONS ──────────────────────
  // GitHub Copilot → Cursor (better value for full IDE)
  const copilotEntry = tools.find((t) => t.tool === "github-copilot" && t.plan !== "free");
  const cursorEntry = tools.find((t) => t.tool === "cursor");
  if (copilotEntry && !cursorEntry && copilotEntry.monthlySpend > 50) {
    const cursorCost = 20 * copilotEntry.seats;
    const savings = copilotEntry.monthlySpend - cursorCost;
    if (savings > 0) {
      recommendations.push({
        id: nanoid(8),
        toolId: copilotEntry.id,
        tool: copilotEntry.tool,
        type: "switch-tool",
        title: "Consider Cursor Pro over GitHub Copilot Business",
        description:
          "Cursor Pro ($20/seat) offers superior context awareness, multi-file edits, and chat in a full IDE — at lower cost than Copilot Business ($19/seat).",
        currentCost: copilotEntry.monthlySpend,
        recommendedCost: cursorCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        confidence: 65,
        severity: "low",
        reason: "Cursor's agentic features often replace the need for Copilot, especially for Teams.",
        actionItems: [
          "Start a 14-day Cursor Pro trial",
          "Run Cursor alongside Copilot for 2 weeks",
          "Survey engineers on preference",
          "Cancel underperformer",
        ],
        alternativeTool: "Cursor",
      });
    }
  }

  // ── 5. BUNDLE RECOMMENDATIONS ────────────────────────────
  const hasMultipleGeneralAI = tools.filter((t) =>
    ["chatgpt", "claude", "gemini", "perplexity"].includes(t.tool) && t.plan !== "free"
  );

  if (hasMultipleGeneralAI.length >= 2) {
    const totalSpendOnGeneral = hasMultipleGeneralAI.reduce(
      (sum, t) => sum + t.monthlySpend,
      0
    );
    const bestSingleOption = Math.min(
      ...hasMultipleGeneralAI.map((t) => t.monthlySpend)
    );
    const savings = totalSpendOnGeneral - bestSingleOption;

    recommendations.push({
      id: nanoid(8),
      toolId: hasMultipleGeneralAI[0].id,
      tool: hasMultipleGeneralAI[0].tool,
      type: "bundle",
      title: "Consolidate general AI assistants",
      description: `You're paying for ${hasMultipleGeneralAI.length} general AI tools. Pick the best one for your team's primary use case.`,
      currentCost: totalSpendOnGeneral,
      recommendedCost: bestSingleOption,
      monthlySavings: savings,
      annualSavings: savings * 12,
      confidence: 80,
      severity: savings > 200 ? "critical" : savings > 50 ? "high" : "medium",
      reason:
        "Most teams don't need more than one primary AI writing/reasoning assistant. Subscription fatigue adds up.",
      actionItems: [
        "Survey team: which AI assistant do they use 80% of the time?",
        "Run a 30-day usage experiment",
        "Pick the winner, cancel the rest",
        "Save cancelled subscriptions for API usage instead",
      ],
    });
  }

  // ── 6. CALCULATE FINAL NUMBERS ───────────────────────────
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsPercentage =
    totalMonthlySpend > 0
      ? Math.min(100, Math.round((totalMonthlySavings / totalMonthlySpend) * 100))
      : 0;

  // Efficiency rating
  let efficiency: AuditResult["summary"]["efficiency"] = "excellent";
  if (savingsPercentage >= 40) efficiency = "poor";
  else if (savingsPercentage >= 25) efficiency = "fair";
  else if (savingsPercentage >= 10) efficiency = "good";

  // Sort recommendations by impact
  recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);

  return {
    id: nanoid(12),
    createdAt: new Date(),
    formData,
    summary: {
      totalMonthlySpend,
      totalAnnualSpend,
      potentialMonthlySavings: Math.round(totalMonthlySavings),
      potentialAnnualSavings: Math.round(totalAnnualSavings),
      savingsPercentage,
      toolCount: tools.length,
      redundantTools,
      efficiency,
    },
    recommendations,
    aiSummary: "", // Filled by AI layer
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    critical: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
    high: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800",
    low: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
    info: "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800",
  };
  return colors[severity];
}
