import mongoose, { Schema, model, models } from "mongoose";
import type { AuditResult, LeadData, SharedReport } from "@/types";

// ============================================================
// AUDIT SCHEMA
// ============================================================

const ToolEntrySchema = new Schema({
  id: { type: String, required: true },
  tool: { type: String, required: true },
  plan: { type: String, required: true },
  monthlySpend: { type: Number, required: true, min: 0 },
  seats: { type: Number, required: true, min: 1 },
  useCase: { type: String, required: true },
  customToolName: { type: String },
});

const AuditSchema = new Schema<AuditResult>(
  {
    id: { type: String, required: true, unique: true, index: true },
    formData: {
      teamSize: { type: Number, required: true },
      industry: { type: String, required: true },
      companyName: { type: String },
      tools: [ToolEntrySchema],
      email: { type: String, required: true, lowercase: true },
      role: { type: String, required: true },
      firstName: { type: String },
      lastName: { type: String },
    },
    summary: {
      totalMonthlySpend: Number,
      totalAnnualSpend: Number,
      potentialMonthlySavings: Number,
      potentialAnnualSavings: Number,
      savingsPercentage: Number,
      toolCount: Number,
      redundantTools: [String],
      efficiency: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
      },
    },
    recommendations: [
      {
        id: String,
        toolId: String,
        tool: String,
        type: String,
        title: String,
        description: String,
        currentCost: Number,
        recommendedCost: Number,
        monthlySavings: Number,
        annualSavings: Number,
        confidence: Number,
        severity: String,
        actionItems: [String],
        alternativeTool: String,
        reason: String,
      },
    ],
    aiSummary: { type: String, default: "" },
    shareId: { type: String, index: true, sparse: true },
  },
  {
    timestamps: true,
    collection: "audits",
  }
);

// Indexes for performance
AuditSchema.index({ createdAt: -1 });
AuditSchema.index({ "formData.email": 1 });

// ============================================================
// LEAD SCHEMA
// ============================================================

const LeadSchema = new Schema<LeadData & { createdAt: Date; source: string }>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email address",
      },
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    company: { type: String, trim: true },
    role: { type: String, required: true },
    teamSize: { type: Number, required: true },
    totalMonthlySpend: { type: Number, required: true },
    potentialSavings: { type: Number, required: true },
    auditId: { type: String, required: true, index: true },
    source: { type: String, default: "audit-form" },
  },
  {
    timestamps: true,
    collection: "leads",
  }
);

LeadSchema.index({ email: 1 }, { unique: true });
LeadSchema.index({ createdAt: -1 });

// ============================================================
// SHARED REPORT SCHEMA
// ============================================================

const SharedReportSchema = new Schema<SharedReport>(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    auditId: { type: String, required: true, index: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    viewCount: { type: Number, default: 0 },
    sanitizedData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: "sharedReports",
  }
);

SharedReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ============================================================
// EXPORT MODELS (prevent re-compilation in hot-reload)
// ============================================================

export const Audit = models.Audit || model("Audit", AuditSchema);
export const Lead = models.Lead || model("Lead", LeadSchema);
export const SharedReport =
  models.SharedReport || model("SharedReport", SharedReportSchema);
