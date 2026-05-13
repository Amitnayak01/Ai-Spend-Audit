"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Trash2, ChevronRight, ChevronLeft,
  Zap, Users, Wrench, Mail, Check, Loader2,
} from "lucide-react";
import { TOOL_METADATA, INDUSTRY_OPTIONS, ROLE_OPTIONS } from "@/lib/audit-engine/tool-data";
import { nanoid } from "nanoid";
import type { AuditFormData, AITool, ToolPlan, UseCase } from "@/types";

// ── VALIDATION SCHEMA ─────────────────────────────────────
const ToolSchema = z.object({
  id: z.string(),
  tool: z.enum(["cursor", "github-copilot", "claude", "chatgpt", "anthropic-api", "openai-api", "gemini", "windsurf", "v0", "perplexity", "midjourney", "other"]),
  plan: z.enum(["free", "pro", "team", "enterprise", "pay-as-you-go", "custom"]),
  monthlySpend: z.number({ invalid_type_error: "Required" }).min(0, "Must be ≥ 0").max(100000),
  seats: z.number({ invalid_type_error: "Required" }).min(1, "At least 1 seat").max(10000),
  useCase: z.enum(["coding", "writing", "research", "design", "customer-support", "data-analysis", "api-integration", "other"]),
  customToolName: z.string().optional(),
});

const FormSchema = z.object({
  teamSize: z.number({ invalid_type_error: "Required" }).min(1).max(100000),
  industry: z.string().min(1, "Please select your industry"),
  companyName: z.string().max(200).optional(),
  tools: z.array(ToolSchema).min(1, "Add at least one AI tool"),
  email: z.string().email("Please enter a valid email"),
  role: z.string().min(1, "Please select your role"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  website: z.string().max(0).optional(), // honeypot
});

type FormValues = z.infer<typeof FormSchema>;

const STORAGE_KEY = "spendscan-audit-draft";

const USE_CASES = [
  { value: "coding", label: "Coding & Dev" },
  { value: "writing", label: "Writing & Docs" },
  { value: "research", label: "Research" },
  { value: "design", label: "Design & UI" },
  { value: "customer-support", label: "Customer Support" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "api-integration", label: "API Integration" },
  { value: "other", label: "Other" },
];

const STEPS = [
  { id: 1, title: "Your Team", icon: Users, description: "Tell us about your team" },
  { id: 2, title: "AI Tools", icon: Wrench, description: "Add all tools you use" },
  { id: 3, title: "Get Results", icon: Mail, description: "Receive your audit" },
];

export default function AuditPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      teamSize: undefined,
      industry: "",
      companyName: "",
      tools: [{ id: nanoid(8), tool: "cursor", plan: "pro", monthlySpend: undefined as unknown as number, seats: 1, useCase: "coding" }],
      email: "",
      role: "",
      firstName: "",
      lastName: "",
      website: "",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tools",
  });

  // ── LOAD FROM LOCALSTORAGE ────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        form.reset(parsed);
        toast.info("Draft restored from your last session");
      }
    } catch {}
  }, [form]);

  // ── SAVE TO LOCALSTORAGE ──────────────────────────────
  const saveToStorage = useCallback(() => {
    try {
      const values = form.getValues();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {}
  }, [form]);

  useEffect(() => {
    const subscription = form.watch(() => saveToStorage());
    return () => subscription.unsubscribe();
  }, [form, saveToStorage]);

  // ── STEP NAVIGATION ───────────────────────────────────
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) fieldsToValidate = ["teamSize", "industry"];
    if (step === 2) fieldsToValidate = ["tools"];

    const valid = await form.trigger(fieldsToValidate as Parameters<typeof form.trigger>[0]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ── SUBMIT ────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to process audit");
      }

      // Clear storage on success
      localStorage.removeItem(STORAGE_KEY);

      // Store result for results page
      sessionStorage.setItem("audit-result", JSON.stringify(result.data));

      toast.success("Audit complete! Redirecting to your results...");
      router.push(`/results?id=${result.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedTools = form.watch("tools");
  const totalSpend = watchedTools?.reduce((sum, t) => sum + (t.monthlySpend || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
          SpendScan <span className="text-sky-500">AI</span>
        </span>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  step === s.id
                    ? "bg-sky-500 text-white"
                    : step > s.id
                    ? "bg-emerald-500 text-white"
                    : "bg-white dark:bg-gray-900 text-gray-400 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {step > s.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:block">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 mx-1 ${step > s.id ? "bg-emerald-300" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Honeypot - hidden from humans */}
            <input type="text" {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

            <AnimatePresence mode="wait">
              {/* ─────────────── STEP 1: Team ─────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
                    Tell us about your team
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    We use this to calculate per-seat costs and team-level optimization opportunities.
                  </p>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Team size <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          {...form.register("teamSize", { valueAsNumber: true })}
                          placeholder="e.g. 12"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                        />
                        {form.formState.errors.teamSize && (
                          <p className="mt-1 text-xs text-red-500">{form.formState.errors.teamSize.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...form.register("industry")}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">Select industry</option>
                          {INDUSTRY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {form.formState.errors.industry && (
                          <p className="mt-1 text-xs text-red-500">{form.formState.errors.industry.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Company name <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        {...form.register("companyName")}
                        placeholder="Acme Inc."
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────── STEP 2: Tools ────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                      Your AI tool stack
                    </h2>
                    {totalSpend > 0 && (
                      <div className="rounded-full bg-sky-50 dark:bg-sky-950 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
                        ${totalSpend.toLocaleString()}/mo total
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Add every AI tool your team currently has a subscription for.
                  </p>

                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const watchedTool = form.watch(`tools.${index}.tool`) as AITool;
                      const toolMeta = TOOL_METADATA[watchedTool];
                      const watchedPlan = form.watch(`tools.${index}.plan`) as ToolPlan;

                      return (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tool</label>
                              <select
                                {...form.register(`tools.${index}.tool`)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                              >
                                {Object.values(TOOL_METADATA).map((tool) => (
                                  <option key={tool.id} value={tool.id}>{tool.name}</option>
                                ))}
                              </select>
                            </div>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="mt-5 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                aria-label="Remove tool"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {watchedTool === "other" && (
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tool name</label>
                              <input
                                {...form.register(`tools.${index}.customToolName`)}
                                placeholder="e.g. Notion AI"
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Plan</label>
                              <select
                                {...form.register(`tools.${index}.plan`)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              >
                                {(toolMeta?.plans || []).map((plan) => (
                                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Seats</label>
                              <input
                                type="number"
                                min={1}
                                {...form.register(`tools.${index}.seats`, { valueAsNumber: true })}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                              {form.formState.errors.tools?.[index]?.seats && (
                                <p className="text-xs text-red-500 mt-0.5">{form.formState.errors.tools[index]?.seats?.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">$/month</label>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                {...form.register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                                placeholder="e.g. 200"
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                              {form.formState.errors.tools?.[index]?.monthlySpend && (
                                <p className="text-xs text-red-500 mt-0.5">{form.formState.errors.tools[index]?.monthlySpend?.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Use case</label>
                              <select
                                {...form.register(`tools.${index}.useCase`)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              >
                                {USE_CASES.map((uc) => (
                                  <option key={uc.value} value={uc.value}>{uc.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Auto-fill hint */}
                          {toolMeta && watchedPlan !== "custom" && watchedPlan !== "pay-as-you-go" && (
                            (() => {
                              const planData = toolMeta.plans.find((p) => p.id === watchedPlan);
                              const seats = form.watch(`tools.${index}.seats`) || 1;
                              const expectedCost = planData ? planData.monthlyPricePerSeat * seats : 0;
                              return expectedCost > 0 ? (
                                <div className="mt-2 text-xs text-gray-400">
                                  Expected: ${expectedCost.toLocaleString()}/mo for {seats} seat{seats !== 1 ? "s" : ""}
                                  {" "}
                                  <button
                                    type="button"
                                    onClick={() => form.setValue(`tools.${index}.monthlySpend`, expectedCost)}
                                    className="text-sky-500 hover:underline"
                                  >
                                    (auto-fill)
                                  </button>
                                </div>
                              ) : null;
                            })()
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {fields.length < 15 && (
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          id: nanoid(8),
                          tool: "chatgpt",
                          plan: "pro",
                          monthlySpend: undefined as unknown as number,
                          seats: 1,
                          useCase: "writing",
                        })
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-3 text-sm font-medium text-gray-500 hover:border-sky-300 hover:text-sky-500 dark:hover:border-sky-800 dark:hover:text-sky-400 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add another tool
                    </button>
                  )}

                  {form.formState.errors.tools?.root && (
                    <p className="mt-2 text-xs text-red-500">{form.formState.errors.tools.root.message}</p>
                  )}
                </motion.div>
              )}

              {/* ─────────────── STEP 3: Lead ─────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
                    Get your personalized report
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    We&apos;ll email your full audit results instantly. No spam, unsubscribe anytime.
                  </p>

                  {/* Summary card */}
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Your current AI spend</div>
                        <div className="text-2xl font-display font-bold text-emerald-900 dark:text-emerald-300">
                          ${totalSpend.toLocaleString()}<span className="text-sm font-normal">/mo</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{fields.length} tool{fields.length !== 1 ? "s" : ""} analyzed</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-500">Results in ~30 seconds</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First name</label>
                        <input
                          {...form.register("firstName")}
                          placeholder="Alex"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last name</label>
                        <input
                          {...form.register("lastName")}
                          placeholder="Rivera"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Work email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...form.register("email")}
                        placeholder="alex@company.com"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      {form.formState.errors.email && (
                        <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Your role <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...form.register("role")}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select your role</option>
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {form.formState.errors.role && (
                        <p className="mt-1 text-xs text-red-500">{form.formState.errors.role.message}</p>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    By submitting, you agree to receive your audit results by email. We don&apos;t sell your data.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-8 py-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex gap-1.5">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all ${
                      step === s.id ? "w-6 bg-sky-500" : step > s.id ? "w-4 bg-emerald-400" : "w-4 bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Get My Audit <Zap className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
