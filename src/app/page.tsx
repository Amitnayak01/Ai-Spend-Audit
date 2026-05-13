"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Zap, Shield, BarChart3, Check, ChevronDown,
  TrendingDown, Users, Brain, Star, Clock
} from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// ── FEATURES ──────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Our engine maps your tool stack against 200+ pricing rules to pinpoint exact overspend.",
    color: "text-violet-500 bg-violet-50 dark:bg-violet-950",
  },
  {
    icon: TrendingDown,
    title: "Redundancy Detection",
    description:
      "Automatically finds overlapping tools — like paying for Cursor AND GitHub Copilot.",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-950",
  },
  {
    icon: BarChart3,
    title: "Instant Dashboard",
    description:
      "Visual savings breakdown with month-by-month projections and prioritized action items.",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "We never store sensitive business data. Your audit results are yours alone.",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  },
  {
    icon: Users,
    title: "Team-Aware",
    description:
      "Seat utilization analysis flags licenses you're paying for but no one is using.",
    color: "text-pink-500 bg-pink-50 dark:bg-pink-950",
  },
  {
    icon: Zap,
    title: "2-Minute Audit",
    description:
      "Fill in your tools, get a personalized report with specific dollar amounts. No fluff.",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
  },
];

// ── TESTIMONIALS ──────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "Found $2,400/year in redundant subscriptions we didn't even know we had. The seat audit feature is gold.",
    name: "Sarah Chen",
    role: "CTO, Vanta-backed startup",
    savings: "$2,400/yr saved",
  },
  {
    quote:
      "Took 3 minutes. Found that we were paying for 8 Cursor seats for a 5-person team. Immediate win.",
    name: "Marcus Webb",
    role: "Engineering Manager, Fintech co.",
    savings: "$480/yr saved",
  },
  {
    quote:
      "We had ChatGPT Team AND Claude Team for 20 people. SpendScan flagged it instantly. One click to fix.",
    name: "Priya Nair",
    role: "Head of Product, B2B SaaS",
    savings: "$6,000/yr saved",
  },
];

// ── FAQ ───────────────────────────────────────────────────
const FAQ = [
  {
    q: "Is my data secure?",
    a: "We only store aggregated spend data (not your billing details, card numbers, or account credentials). Your email is used solely to deliver your report.",
  },
  {
    q: "How accurate are the savings estimates?",
    a: "Estimates are based on publicly available pricing for each tool. Actual savings depend on your current contracts and negotiated rates, but our redundancy and seat-utilization findings are always exact.",
  },
  {
    q: "Which AI tools do you support?",
    a: "Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf, v0 by Vercel, Perplexity, Midjourney, and any custom tool.",
  },
  {
    q: "Is this free?",
    a: "Yes — the full audit is completely free. We monetize through consulting services for teams that want hands-on optimization help.",
  },
  {
    q: "How long does it take?",
    a: "Under 3 minutes for a team of 10 with 5 AI tools. Results are instant.",
  },
];

// ── STATS ─────────────────────────────────────────────────
const STATS = [
  { value: "$847", label: "Avg. monthly savings found", suffix: "" },
  { value: "34", label: "Of AI spend is redundant", suffix: "%" },
  { value: "2", label: "Minutes to complete audit", suffix: "min" },
  { value: "100", label: "Free — no credit card", suffix: "%" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── NAV ──────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                SpendScan <span className="text-sky-500">AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How it works</a>
              <a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</a>
            </div>
            <Link
              href="/audit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
            >
              Start Free Audit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20">
        {/* Background grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 -z-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 -z-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={STAGGER}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div variants={FADE_UP}>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-400 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                </span>
                Free AI spend audit — no credit card required
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={FADE_UP}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-gray-900 dark:text-white mb-6"
            >
              Your team is probably{" "}
              <span className="gradient-text">wasting money</span>
              <br />
              on AI tools right now
            </motion.h1>

            <motion.p
              variants={FADE_UP}
              className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed"
            >
              The average tech team overspends by 34% on AI subscriptions through
              redundant tools, unused seats, and wrong plans. Find your hidden
              savings in under 2 minutes.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={FADE_UP}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                href="/audit"
                className="group inline-flex items-center gap-2 rounded-xl bg-sky-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 transition-all hover:shadow-sky-500/40 hover:-translate-y-0.5"
              >
                Start Free Audit
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-7 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                See how it works
                <ChevronDown className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={FADE_UP}
              className="mt-8 flex items-center gap-4 text-sm text-gray-400"
            >
              <div className="flex -space-x-2">
                {["👩🏻‍💻", "👨🏾‍💼", "👩🏼‍🔬", "👨🏻‍💻"].map((emoji, i) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-gray-950 bg-gray-100 dark:bg-gray-800 text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span>500+ teams audited this month</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                  {stat.value}
                  <span className="text-sky-500">{stat.suffix}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              3 steps. 2 minutes. Real savings.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              No consultants. No spreadsheets. Just fill in your tools and get
              actionable results instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

            {[
              {
                step: "01",
                icon: Users,
                title: "Add your AI tools",
                desc: "Tell us which AI tools your team uses, how many seats, and what you pay monthly.",
                color: "text-sky-500",
              },
              {
                step: "02",
                icon: Brain,
                title: "We run the audit",
                desc: "Our engine compares your stack against 200+ pricing rules and redundancy patterns.",
                color: "text-violet-500",
              },
              {
                step: "03",
                icon: TrendingDown,
                title: "Get your savings plan",
                desc: "Receive a personalized report with specific dollar amounts you can save starting today.",
                color: "text-emerald-500",
              },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                  <Icon className={`h-8 w-8 ${color}`} />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-xs font-bold text-white dark:text-gray-900">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 font-semibold text-white hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/25"
            >
              Start your free audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section
        id="features"
        className="py-20 bg-gray-50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to optimize
              <br />
              your AI tool stack
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Teams saving real money
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {t.name}
                    </div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                  <div className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {t.savings}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section
        id="faq"
        className="py-20 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white select-none list-none">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-sky-500 to-sky-700 p-10 shadow-2xl shadow-sky-500/20"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Ready to stop overpaying?
            </h2>
            <p className="text-sky-100 mb-8 text-lg">
              Free forever. No credit card. Results in 2 minutes.
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-sky-600 hover:bg-sky-50 transition-colors shadow-lg"
            >
              <Clock className="h-5 w-5" />
              Start Free Audit — Takes 2 Minutes
            </Link>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-sky-200">
              {["No credit card", "Instant results", "100% free"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-gray-900 dark:text-white">
                SpendScan AI
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/audit" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                Start Audit
              </Link>
              <a href="mailto:hello@spendscan.ai" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                Contact
              </a>
              <span>© 2025 SpendScan AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
