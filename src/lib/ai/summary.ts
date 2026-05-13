import type { AuditResult } from "@/types";
import { TOOL_METADATA } from "@/lib/audit-engine/tool-data";

// ============================================================
// AI SUMMARY GENERATOR
// Uses Gemini API with graceful fallback
// ============================================================

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generateAISummary(audit: AuditResult): Promise<string> {
  const { summary, recommendations, formData } = audit;

  const topRecs = recommendations.slice(0, 3);
  const toolNames = formData.tools
    .map((t) => TOOL_METADATA[t.tool]?.name || t.tool)
    .join(", ");

  const prompt = `You are a senior financial advisor specializing in AI tool spending optimization.

Write a concise, actionable 100-word summary for a ${formData.industry} company with ${formData.teamSize} people.

They spend $${summary.totalMonthlySpend}/month on AI tools (${toolNames}).

Our audit found they could save $${summary.potentialMonthlySavings}/month ($${summary.potentialAnnualSavings}/year — ${summary.savingsPercentage}% reduction).

Top recommendations:
${topRecs.map((r, i) => `${i + 1}. ${r.title}: saves $${r.monthlySavings}/mo`).join("\n")}

Write the summary in second person ("Your team..."), be specific about the savings opportunity, and end with one motivating sentence. Be direct, not fluffy. No bullet points — flowing prose only.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No Gemini API key");

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
          topK: 40,
          topP: 0.95,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty response from Gemini");

    return text.trim();
  } catch (err) {
    console.warn("Gemini API failed, using fallback:", err);
    return generateFallbackSummary(audit);
  }
}

// ============================================================
// FALLBACK SUMMARY (always works, no API needed)
// ============================================================

function generateFallbackSummary(audit: AuditResult): string {
  const { summary, formData, recommendations } = audit;
  const topRec = recommendations[0];

  const efficiencyText = {
    excellent: "well-optimized",
    good: "reasonably managed",
    fair: "has room for improvement",
    poor: "significantly over-budget",
  }[summary.efficiency];

  let text = `Your team of ${formData.teamSize} is spending $${summary.totalMonthlySpend.toLocaleString()} per month on ${summary.toolCount} AI tools — a stack that's ${efficiencyText}. `;

  if (summary.potentialMonthlySavings > 0) {
    text += `Our audit identified $${summary.potentialMonthlySavings.toLocaleString()}/month in potential savings ($${summary.potentialAnnualSavings.toLocaleString()}/year). `;
  }

  if (summary.redundantTools.length > 0) {
    text += `Key findings include ${summary.redundantTools.length} redundant tool${summary.redundantTools.length > 1 ? "s" : ""}. `;
  }

  if (topRec) {
    text += `Your highest-impact opportunity: ${topRec.title}, which could save $${topRec.monthlySavings}/month. `;
  }

  text +=
    summary.savingsPercentage > 20
      ? `Implementing these recommendations would free up significant budget for higher-ROI investments.`
      : `Even small optimizations compound into meaningful savings over time.`;

  return text;
}
