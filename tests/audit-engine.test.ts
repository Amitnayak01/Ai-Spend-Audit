import { describe, it, expect } from "vitest";
import { runAuditEngine, formatCurrency, getSeverityColor } from "@/lib/audit-engine";
import type { AuditFormData } from "@/types";

// ── TEST HELPERS ──────────────────────────────────────────
const makeFormData = (overrides: Partial<AuditFormData> = {}): AuditFormData => ({
  teamSize: 10,
  industry: "Technology",
  companyName: "Acme Inc",
  tools: [
    {
      id: "tool-1",
      tool: "cursor",
      plan: "pro",
      monthlySpend: 200,
      seats: 10,
      useCase: "coding",
    },
  ],
  email: "test@acme.com",
  role: "Engineering Manager",
  ...overrides,
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 1: Basic audit calculation
// ─────────────────────────────────────────────────────────
describe("Audit Engine — Core Calculations", () => {
  it("calculates totalMonthlySpend correctly from all tools", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
        { id: "t2", tool: "chatgpt", plan: "pro", monthlySpend: 100, seats: 5, useCase: "writing" },
        { id: "t3", tool: "gemini", plan: "free", monthlySpend: 0, seats: 10, useCase: "research" },
      ],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.totalMonthlySpend).toBe(300);
  });

  it("calculates totalAnnualSpend as 12x monthly", () => {
    const formData = makeFormData({
      tools: [{ id: "t1", tool: "chatgpt", plan: "team", monthlySpend: 500, seats: 20, useCase: "writing" }],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.totalAnnualSpend).toBe(6000);
  });

  it("returns a unique ID for each audit run", () => {
    const formData = makeFormData();
    const result1 = runAuditEngine(formData);
    const result2 = runAuditEngine(formData);
    expect(result1.id).not.toBe(result2.id);
  });

  it("includes createdAt timestamp close to now", () => {
    const before = Date.now();
    const result = runAuditEngine(makeFormData());
    const after = Date.now();

    const ts = new Date(result.createdAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("returns zero savings when there are no issues", () => {
    // Single free tool — no overspend, no redundancy
    const formData = makeFormData({
      tools: [{ id: "t1", tool: "cursor", plan: "free", monthlySpend: 0, seats: 1, useCase: "coding" }],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.potentialMonthlySavings).toBe(0);
    expect(result.recommendations).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 2: Redundancy detection
// ─────────────────────────────────────────────────────────
describe("Audit Engine — Redundancy Detection", () => {
  it("detects Cursor + GitHub Copilot as redundant", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
        { id: "t2", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    const redundancyRec = result.recommendations.find((r) => r.type === "eliminate");
    expect(redundancyRec).toBeDefined();
    expect(redundancyRec?.monthlySavings).toBeGreaterThan(0);
  });

  it("detects ChatGPT + Claude as redundant general AI tools", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "chatgpt", plan: "team", monthlySpend: 500, seats: 20, useCase: "writing" },
        { id: "t2", tool: "claude", plan: "team", monthlySpend: 500, seats: 20, useCase: "writing" },
      ],
    });

    const result = runAuditEngine(formData);
    // Engine may flag as redundancy (eliminate) or consolidation (bundle) — both are correct
    const redundancyOrBundle = result.recommendations.find(
      (r) => r.type === "eliminate" || r.type === "bundle"
    );
    expect(redundancyOrBundle).toBeDefined();
    expect(redundancyOrBundle?.monthlySavings).toBeGreaterThan(0);
  });

  it("eliminates the more expensive tool when redundancy found", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 100, seats: 5, useCase: "coding" },
        { id: "t2", tool: "windsurf", plan: "team", monthlySpend: 350, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    const rec = result.recommendations.find((r) => r.type === "eliminate");
    // Should suggest eliminating the more expensive one
    expect(rec?.currentCost).toBe(350);
  });

  it("adds redundant tool names to summary.redundantTools", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
        { id: "t2", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.redundantTools.length).toBeGreaterThan(0);
  });

  it("does NOT flag two different-category tools as redundant", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
        { id: "t2", tool: "midjourney", plan: "team", monthlySpend: 300, seats: 10, useCase: "design" },
      ],
    });

    const result = runAuditEngine(formData);
    const redundancyRec = result.recommendations.find((r) => r.type === "eliminate");
    expect(redundancyRec).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 3: Seat overspend detection
// ─────────────────────────────────────────────────────────
describe("Audit Engine — Seat Utilization", () => {
  it("flags excess seats when seats > teamSize", () => {
    const formData = makeFormData({
      teamSize: 5,
      tools: [
        { id: "t1", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    const seatRec = result.recommendations.find((r) => r.type === "reduce-seats");
    expect(seatRec).toBeDefined();
    expect(seatRec?.monthlySavings).toBeGreaterThan(0);
  });

  it("calculates seat savings correctly", () => {
    // GitHub Copilot Business = $19/seat
    // 10 seats, team of 5 → 5 excess seats → $95/mo savings
    const formData = makeFormData({
      teamSize: 5,
      tools: [
        { id: "t1", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    const seatRec = result.recommendations.find((r) => r.type === "reduce-seats");
    expect(seatRec?.monthlySavings).toBe(95); // 5 excess × $19
  });

  it("does NOT flag seats when seats <= teamSize", () => {
    const formData = makeFormData({
      teamSize: 15,
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    const seatRec = result.recommendations.find((r) => r.type === "reduce-seats");
    expect(seatRec).toBeUndefined();
  });

  it("assigns 90% confidence to seat reduction recommendations", () => {
    const formData = makeFormData({
      teamSize: 3,
      tools: [
        { id: "t1", tool: "claude", plan: "team", monthlySpend: 250, seats: 10, useCase: "writing" },
      ],
    });

    const result = runAuditEngine(formData);
    const seatRec = result.recommendations.find((r) => r.type === "reduce-seats");
    expect(seatRec?.confidence).toBe(90);
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 4: API overspend
// ─────────────────────────────────────────────────────────
describe("Audit Engine — API Overspend", () => {
  it("flags high pay-as-you-go API spend", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "openai-api", plan: "pay-as-you-go", monthlySpend: 800, seats: 1, useCase: "api-integration" },
      ],
    });

    const result = runAuditEngine(formData);
    const optimizeRec = result.recommendations.find((r) => r.type === "optimize");
    expect(optimizeRec).toBeDefined();
  });

  it("does NOT flag API spend under threshold ($200)", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "openai-api", plan: "pay-as-you-go", monthlySpend: 150, seats: 1, useCase: "api-integration" },
      ],
    });

    const result = runAuditEngine(formData);
    const optimizeRec = result.recommendations.find((r) => r.type === "optimize");
    expect(optimizeRec).toBeUndefined();
  });

  it("recommends ~30% reduction for high API spend", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "anthropic-api", plan: "pay-as-you-go", monthlySpend: 1000, seats: 1, useCase: "api-integration" },
      ],
    });

    const result = runAuditEngine(formData);
    const optimizeRec = result.recommendations.find((r) => r.type === "optimize");
    expect(optimizeRec?.monthlySavings).toBe(300); // 30% of $1000
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 5: Bundle recommendations
// ─────────────────────────────────────────────────────────
describe("Audit Engine — Bundle Detection", () => {
  it("recommends consolidation when 2+ general AI tools are paid", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "chatgpt", plan: "pro", monthlySpend: 400, seats: 20, useCase: "writing" },
        { id: "t2", tool: "gemini", plan: "team", monthlySpend: 600, seats: 20, useCase: "writing" },
        { id: "t3", tool: "perplexity", plan: "pro", monthlySpend: 400, seats: 20, useCase: "research" },
      ],
    });

    const result = runAuditEngine(formData);
    const bundleRec = result.recommendations.find((r) => r.type === "bundle");
    expect(bundleRec).toBeDefined();
  });

  it("sorts recommendations by monthlySavings descending", () => {
    const formData = makeFormData({
      teamSize: 5,
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 100, seats: 5, useCase: "coding" },
        { id: "t2", tool: "github-copilot", plan: "team", monthlySpend: 300, seats: 15, useCase: "coding" },
        { id: "t3", tool: "chatgpt", plan: "team", monthlySpend: 250, seats: 10, useCase: "writing" },
        { id: "t4", tool: "claude", plan: "team", monthlySpend: 200, seats: 8, useCase: "writing" },
      ],
    });

    const result = runAuditEngine(formData);
    const savings = result.recommendations.map((r) => r.monthlySavings);
    for (let i = 0; i < savings.length - 1; i++) {
      expect(savings[i]).toBeGreaterThanOrEqual(savings[i + 1]);
    }
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 6: Efficiency ratings
// ─────────────────────────────────────────────────────────
describe("Audit Engine — Efficiency Ratings", () => {
  it("rates as 'excellent' when no issues found (0% savings)", () => {
    // Single free tool, team size = seats, no redundancy → zero findings
    const formData = makeFormData({
      teamSize: 10,
      tools: [
        { id: "t1", tool: "cursor", plan: "free", monthlySpend: 0, seats: 10, useCase: "coding" },
      ],
    });
    const result = runAuditEngine(formData);
    expect(result.summary.efficiency).toBe("excellent");
    expect(result.summary.potentialMonthlySavings).toBe(0);
  });

  it("annualSavings equals monthlySavings × 12", () => {
    const formData = makeFormData({
      teamSize: 3,
      tools: [
        { id: "t1", tool: "claude", plan: "team", monthlySpend: 250, seats: 10, useCase: "writing" },
      ],
    });

    const result = runAuditEngine(formData);
    const rec = result.recommendations.find((r) => r.type === "reduce-seats");
    if (rec) {
      expect(rec.annualSavings).toBe(rec.monthlySavings * 12);
    }
  });

  it("summary annualSavings equals summary monthlySavings × 12", () => {
    const formData = makeFormData({
      teamSize: 3,
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
        { id: "t2", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.potentialAnnualSavings).toBe(
      result.summary.potentialMonthlySavings * 12
    );
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 7: Utility functions
// ─────────────────────────────────────────────────────────
describe("Utility Functions", () => {
  it("formatCurrency formats numbers as USD", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(10000)).toBe("$10,000");
  });

  it("formatCurrency handles decimals by rounding", () => {
    expect(formatCurrency(9.99)).toBe("$10");
    expect(formatCurrency(99.5)).toBe("$100");
  });

  it("getSeverityColor returns different classes for each severity", () => {
    const critical = getSeverityColor("critical");
    const low = getSeverityColor("low");
    expect(critical).not.toBe(low);
    expect(critical).toContain("red");
    expect(low).toContain("blue");
  });

  it("getSeverityColor returns a string for all severities", () => {
    const severities = ["critical", "high", "medium", "low", "info"] as const;
    severities.forEach((s) => {
      expect(typeof getSeverityColor(s)).toBe("string");
      expect(getSeverityColor(s).length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 8: Edge cases
// ─────────────────────────────────────────────────────────
describe("Audit Engine — Edge Cases", () => {
  it("handles a single free tool with no spend gracefully", () => {
    const formData = makeFormData({
      tools: [{ id: "t1", tool: "gemini", plan: "free", monthlySpend: 0, seats: 1, useCase: "research" }],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.totalMonthlySpend).toBe(0);
    expect(result.summary.savingsPercentage).toBe(0);
    expect(result.recommendations).toHaveLength(0);
  });

  it("handles large team sizes without errors", () => {
    const formData = makeFormData({
      teamSize: 5000,
      tools: [
        { id: "t1", tool: "github-copilot", plan: "enterprise", monthlySpend: 195000, seats: 5000, useCase: "coding" },
      ],
    });

    expect(() => runAuditEngine(formData)).not.toThrow();
  });

  it("handles maximum number of tools (15)", () => {
    const tools = Array.from({ length: 15 }, (_, i) => ({
      id: `t${i}`,
      tool: "other" as const,
      plan: "custom" as const,
      monthlySpend: 100,
      seats: 5,
      useCase: "other" as const,
      customToolName: `Tool ${i}`,
    }));

    const formData = makeFormData({ tools });
    expect(() => runAuditEngine(formData)).not.toThrow();

    const result = runAuditEngine(formData);
    expect(result.summary.totalMonthlySpend).toBe(1500);
  });

  it("savingsPercentage is clamped to meaningful values", () => {
    const formData = makeFormData({
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "coding" },
        { id: "t2", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    expect(result.summary.savingsPercentage).toBeGreaterThanOrEqual(0);
    expect(result.summary.savingsPercentage).toBeLessThanOrEqual(100);
  });

  it("every recommendation has required fields", () => {
    const formData = makeFormData({
      teamSize: 5,
      tools: [
        { id: "t1", tool: "cursor", plan: "pro", monthlySpend: 100, seats: 5, useCase: "coding" },
        { id: "t2", tool: "github-copilot", plan: "team", monthlySpend: 190, seats: 10, useCase: "coding" },
      ],
    });

    const result = runAuditEngine(formData);
    result.recommendations.forEach((rec) => {
      expect(rec.id).toBeDefined();
      expect(rec.type).toBeDefined();
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(rec.monthlySavings).toBeGreaterThanOrEqual(0);
      expect(rec.annualSavings).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeGreaterThan(0);
      expect(rec.confidence).toBeLessThanOrEqual(100);
      expect(Array.isArray(rec.actionItems)).toBe(true);
      expect(rec.actionItems.length).toBeGreaterThan(0);
    });
  });
});
