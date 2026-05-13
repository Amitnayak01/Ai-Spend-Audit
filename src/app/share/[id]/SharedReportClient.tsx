"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingDown, Zap, AlertTriangle, ArrowRight,
  BarChart3, Calendar, Award, Eye,
} from "lucide-react";
import type { AuditResult, Recommendation, SeverityLevel } from "@/types";

const SEVERITY_BADGE: Record<SeverityLevel, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  info: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

interface SharedData {
  id: string;
  shareId: string;
  summary: AuditResult["summary"];
  recommendations: Recommendation[];
  aiSummary: string;
  createdAt: string;
  teamInfo: {
    teamSize: number;
    industry: string;
    toolCount: number;
  };
}

export default function SharedReportClient({ shareId }: { shareId: string }) {
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share?shareId=${shareId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.error || "Report not found");
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950 px-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report not found</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <Link
          href="/audit"
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
        >
          Run Your Own Audit
        </Link>
      </div>
    );
  }

  const { summary, recommendations, aiSummary, teamInfo } = data;
  const createdDate = new Date(data.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      {/* Header */}
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
              SpendScan <span className="text-sky-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Eye className="h-3.5 w-3.5" />
            Shared report · {createdDate}
          </div>
        </div>

        {/* Context banner */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-4 py-3 mb-6 text-sm text-amber-800 dark:text-amber-300">
          This is a shared audit for a <strong>{teamInfo.industry}</strong> team of{" "}
          <strong>{teamInfo.teamSize}</strong> people using{" "}
          <strong>{teamInfo.toolCount}</strong> AI tools.
        </div>

        {/* Savings hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 mb-6 text-white shadow-xl shadow-emerald-500/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-emerald-200" />
                <span className="text-emerald-100 font-medium text-sm">Potential Annual Savings</span>
              </div>
              <div className="text-5xl font-display font-bold">
                ${summary.potentialAnnualSavings.toLocaleString()}
              </div>
              <div className="mt-2 text-emerald-100 text-sm">
                ${summary.potentialMonthlySavings.toLocaleString()}/month · {summary.savingsPercentage}% reduction
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Monthly Spend", value: `$${summary.totalMonthlySpend.toLocaleString()}`, icon: BarChart3, color: "text-sky-500" },
            { label: "Annual Spend", value: `$${summary.totalAnnualSpend.toLocaleString()}`, icon: Calendar, color: "text-violet-500" },
            { label: "Tools Audited", value: summary.toolCount, icon: Zap, color: "text-amber-500" },
            { label: "Recommendations", value: recommendations.length, icon: Award, color: "text-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <stat.icon className={`h-4 w-4 ${stat.color} mb-2`} />
              <div className="text-xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-sky-800 dark:text-sky-300">AI Analysis</span>
            </div>
            <p className="text-sm text-sky-900 dark:text-sky-200 leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {/* Recommendations */}
        <div className="mb-8">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">
            Top Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[rec.severity]}`}>
                        {rec.severity}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{rec.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      -${rec.monthlySavings.toLocaleString()}/mo
                    </div>
                    <div className="text-xs text-gray-400">${rec.annualSavings.toLocaleString()}/yr</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Run your own CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gray-900 dark:bg-white p-8 text-center"
        >
          <h3 className="text-xl font-display font-bold text-white dark:text-gray-900 mb-2">
            Curious what you could save?
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
            Run your own free audit in under 2 minutes.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            Start Free Audit <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
