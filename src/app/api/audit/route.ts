import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { Audit, Lead } from "@/lib/db/models";
import { runAuditEngine } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai/summary";
import { sendAuditResultsEmail, sendLeadNotificationEmail } from "@/lib/email";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { nanoid } from "nanoid";

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const ToolEntrySchema = z.object({
  id: z.string(),
  tool: z.enum([
    "cursor", "github-copilot", "claude", "chatgpt",
    "anthropic-api", "openai-api", "gemini", "windsurf",
    "v0", "perplexity", "midjourney", "other",
  ]),
  plan: z.enum([
    "free", "pro", "team", "enterprise", "pay-as-you-go", "custom",
  ]),
  monthlySpend: z.number().min(0).max(100000),
  seats: z.number().min(1).max(10000),
  useCase: z.enum([
    "coding", "writing", "research", "design",
    "customer-support", "data-analysis", "api-integration", "other",
  ]),
  customToolName: z.string().optional(),
});

const AuditRequestSchema = z.object({
  teamSize: z.number().min(1).max(100000),
  industry: z.string().min(1).max(100),
  companyName: z.string().max(200).optional(),
  tools: z.array(ToolEntrySchema).min(1).max(20),
  email: z.string().email(),
  role: z.string().min(1).max(100),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  // Honeypot field - must be empty
  website: z.string().max(0).optional(),
});

// ============================================================
// POST /api/audit
// ============================================================

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const { success, remaining } = rateLimit(`audit:${clientIP}`);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a minute." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  try {
    const body = await request.json();

    // Honeypot check
    if (body.website && body.website.length > 0) {
      // Bot detected — silently succeed to not reveal detection
      return NextResponse.json({ success: true, data: { id: nanoid(12) } });
    }

    // Validate input
    const parseResult = AuditRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const formData = parseResult.data;

    // Run audit engine (sync, no AI)
    const auditResult = runAuditEngine(formData as Parameters<typeof runAuditEngine>[0]);

    // Generate AI summary (async, with fallback)
    auditResult.aiSummary = await generateAISummary(auditResult);

    // Generate share ID
    const shareId = nanoid(10);
    auditResult.shareId = shareId;

    // Save to MongoDB
    await connectDB();

    await Audit.create({
      ...auditResult,
      formData: {
        ...formData,
        email: formData.email.toLowerCase(),
      },
    });

    // Upsert lead
    const leadData = {
      email: formData.email.toLowerCase(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.companyName,
      role: formData.role,
      teamSize: formData.teamSize,
      totalMonthlySpend: auditResult.summary.totalMonthlySpend,
      potentialSavings: auditResult.summary.potentialMonthlySavings,
      auditId: auditResult.id,
    };

    await Lead.findOneAndUpdate(
      { email: leadData.email },
      { $set: leadData },
      { upsert: true, new: true }
    );

    // Send emails (non-blocking)
    Promise.all([
      sendAuditResultsEmail(leadData, auditResult).catch(console.error),
      sendLeadNotificationEmail(leadData).catch(console.error),
    ]);

    // Return sanitized result (no PII in response)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: auditResult.id,
          shareId,
          summary: auditResult.summary,
          recommendations: auditResult.recommendations,
          aiSummary: auditResult.aiSummary,
          createdAt: auditResult.createdAt,
        },
      },
      {
        status: 201,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      }
    );
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/audit?id=xxx
// ============================================================

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Audit ID required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const audit = await Audit.findOne({ id }).select("-formData.email -__v");

    if (!audit) {
      return NextResponse.json(
        { success: false, error: "Audit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: audit });
  } catch (error) {
    console.error("Get audit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit" },
      { status: 500 }
    );
  }
}
