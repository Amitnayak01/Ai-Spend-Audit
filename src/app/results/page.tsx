"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingDown, Copy, Share2, Mail, AlertTriangle,
  ChevronDown, ChevronUp, Check, ArrowLeft, Zap, ExternalLink,
  BarChart3, Calendar, Lightbulb, Award,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import type { AuditResult, Recommendation, SeverityLevel } from "@/types";
import { TOOL_METADATA } from "@/lib/audit-engine/tool-data";

// ── SEVERITY CONFIG ───────────────────────────────────────
const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" },
  high: { label: "High Impact", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800" },
  medium: { label: "Medium", color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800" },
  low: { label: "Low", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" },
  info: { label: "Info", color: "text-gray-700 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700" },
};

const TYPE_ICONS: Record<Recommendation["type"], string> = {
  downgrade: "⬇️",
  "switch-tool": "🔄",
  "reduce-seats": "👥",
  bundle: "📦",
  eliminate: "❌",
  optimize: "⚡",
};

const EFFICIENCY_CONFIG = {
  excellent: { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  good: { label: "Good", color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  fair: { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
  poor: { label: "Poor", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
};

// ── RECOMMENDATION CARD ───────────────────────────────────
function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const config = SEVERITY_CONFIG[rec.severity];
  const toolName = TOOL_METADATA[rec.tool]?.name || rec.tool;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border ${config.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[rec.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500">{toolName}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                {rec.title}
              </h3>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                -${rec.monthlySavings.toLocaleString()}<span className="text-xs font-normal">/mo</span>
              </div>
              <div className="text-xs text-emerald-600/70">
                ${rec.annualSavings.toLocaleString()}/yr
              </div>
            </div>
          </div>
          {!expanded && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {rec.description}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-0 ml-14 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {rec.description}
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-3">
              <div className="text-xs text-gray-400 mb-0.5">Current cost</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                ${rec.currentCost.toLocaleString()}/mo
              </div>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-3">
              <div className="text-xs text-gray-400 mb-0.5">After fix</div>
              <div className="font-semibold text-emerald-600">
                ${rec.recommendedCost.toLocaleString()}/mo
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 p-3">
              <div className="text-xs text-emerald-600 mb-0.5">You save</div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                ${rec.annualSavings.toLocaleString()}/yr
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Action items
            </div>
            <ol className="space-y-1.5">
              {rec.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400 font-semibold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
            <span>Confidence: {rec.confidence}%</span>
            <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-1 rounded-full bg-sky-400"
                style={{ width: `${rec.confidence}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── SKELETON LOADERS ──────────────────────────────────────
function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  );
}

// ── MAIN RESULTS PAGE ─────────────────────────────────────
function ResultsContent() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

  useEffect(() => {
    // Try sessionStorage first (instant)
    const cached = sessionStorage.getItem("audit-result");
    if (cached) {
      try {
        setAudit(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {}
    }

    // Fallback: fetch from API
    if (!auditId) {
      setError("No audit ID found. Please run a new audit.");
      setLoading(false);
      return;
    }

    fetch(`/api/audit?id=${auditId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAudit(data.data);
        else setError(data.error || "Failed to load audit");
      })
      .catch(() => setError("Failed to load audit results"))
      .finally(() => setLoading(false));
  }, [auditId]);

  const shareUrl = audit?.shareId
    ? `${APP_URL}/share/${audit.shareId}`
    : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sky-500 font-medium text-sm mb-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            Analyzing your AI stack...
          </div>
        </div>
        <ResultsSkeleton />
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit not found</h2>
        <p className="text-gray-500">{error}</p>
        <Link href="/audit" className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors">
          Run New Audit
        </Link>
      </div>
    );
  }

  const { summary, recommendations, aiSummary } = audit;
  const efficiency = EFFICIENCY_CONFIG[summary.efficiency];

  // Chart data
  const spendBreakdown = audit.formData?.tools?.map((tool) => ({
    name: TOOL_METADATA[tool.tool]?.name || tool.tool,
    value: tool.monthlySpend,
  })) || [];

  const CHART_COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

  const savingsData = [
    { name: "Current Spend", value: summary.totalMonthlySpend, fill: "#e5e7eb" },
    { name: "After Optimization", value: summary.totalMonthlySpend - summary.potentialMonthlySavings, fill: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/audit"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            New Audit
          </Link>
          <div className="flex items-center gap-2">
            {shareUrl && (
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            )}
            <Link
              href="/audit"
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              Share Report
            </Link>
          </div>
        </div>

        {/* Hero savings card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 mb-6 text-white shadow-xl shadow-emerald-500/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-5 w-5" />
                <span className="text-emerald-100 font-medium">Potential Annual Savings</span>
              </div>
              <div className="text-5xl font-display font-bold">
                ${summary.potentialAnnualSavings.toLocaleString()}
              </div>
              <div className="mt-2 text-emerald-100">
                ${summary.potentialMonthlySavings.toLocaleString()}/month · {summary.savingsPercentage}% reduction
              </div>
            </div>
            <div className={`rounded-xl px-4 py-2 text-sm font-semibold ${efficiency.bg} ${efficiency.color}`}>
              {efficiency.label} efficiency
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Monthly Spend", value: `$${summary.totalMonthlySpend.toLocaleString()}`, icon: BarChart3, color: "text-sky-500" },
            { label: "Annual Spend", value: `$${summary.totalAnnualSpend.toLocaleString()}`, icon: Calendar, color: "text-violet-500" },
            { label: "Tools Audited", value: summary.toolCount, icon: Zap, color: "text-amber-500" },
            { label: "Recommendations", value: recommendations.length, icon: Award, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <div className="text-xl font-display font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                AI Analysis
              </span>
            </div>
            <p className="text-sm text-sky-900 dark:text-sky-200 leading-relaxed">
              {aiSummary}
            </p>
          </motion.div>
        )}

        {/* Charts */}
        {spendBreakdown.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spend Breakdown</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-full sm:w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {spendBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}/mo`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {spendBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${item.value.toLocaleString()}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">
              {recommendations.length} Recommendations
            </h3>
            <span className="text-sm text-gray-400">Sorted by impact</span>
          </div>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-8 text-center">
              <div className="text-3xl mb-3">🎉</div>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                Your AI stack is well-optimized!
              </h4>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                We didn&apos;t find any significant savings opportunities. Keep it up!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={rec.id} rec={rec} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Share section */}
        {shareUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-6"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share this report
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 font-mono truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">
            Need help implementing these changes?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Our team can help you negotiate contracts, migrate tools, and set up cost monitoring.
          </p>
          <a
            href="mailto:hello@spendscan.ai"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Credex Team
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
