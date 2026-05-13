import { Resend } from "resend";
import type { AuditResult, LeadData } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@spendscan.ai";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hello@spendscan.ai";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://spendscan.ai";

// ============================================================
// AUDIT RESULTS EMAIL
// ============================================================

export async function sendAuditResultsEmail(
  lead: LeadData,
  audit: AuditResult
): Promise<void> {
  const { summary, recommendations } = audit;
  const firstName = lead.firstName || "there";
  const shareUrl = audit.shareId ? `${APP_URL}/share/${audit.shareId}` : null;

  const topRecs = recommendations.slice(0, 3);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Spend Audit Results</title>
</head>
<body style="margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 40px 32px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;">SpendScan AI</div>
      <div style="font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 4px;">Your AI Spend Audit is Ready</div>
    </div>

    <!-- Savings Banner -->
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px 32px; margin: 0;">
      <div style="font-size: 13px; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Potential Annual Savings</div>
      <div style="font-size: 36px; font-weight: 700; color: #065f46; line-height: 1.2;">$${summary.potentialAnnualSavings.toLocaleString()}</div>
      <div style="font-size: 14px; color: #047857; margin-top: 4px;">${summary.savingsPercentage}% reduction in AI tool spend</div>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi ${firstName},</p>
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px;">${audit.aiSummary || `Your audit found $${summary.potentialMonthlySavings.toLocaleString()}/month in savings opportunities across your ${summary.toolCount} AI tools.`}</p>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700; color: #111827;">$${summary.totalMonthlySpend.toLocaleString()}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Monthly Spend</div>
        </div>
        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700; color: #10b981;">$${summary.potentialMonthlySavings.toLocaleString()}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Monthly Savings</div>
        </div>
        <div style="background: #fff7ed; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700; color: #ea580c;">${summary.toolCount}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Tools Audited</div>
        </div>
      </div>

      <!-- Top Recommendations -->
      <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px;">Top Recommendations</h3>
      ${topRecs
        .map(
          (rec) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">${rec.title}</div>
            <div style="font-size: 14px; font-weight: 700; color: #10b981; white-space: nowrap; margin-left: 16px;">-$${rec.monthlySavings}/mo</div>
          </div>
          <div style="font-size: 13px; color: #6b7280; line-height: 1.5;">${rec.description}</div>
        </div>
      `
        )
        .join("")}

      <!-- CTA -->
      ${
        shareUrl
          ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${shareUrl}" style="display: inline-block; background: #0ea5e9; color: white; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Full Report →</a>
        </div>
      `
          : ""
      }

      <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        This report was generated by SpendScan AI based on the information you provided. Results are estimates and actual savings may vary. 
        <br><br>
        <a href="${APP_URL}" style="color: #0ea5e9;">SpendScan AI</a> · 
        <a href="${APP_URL}/audit" style="color: #0ea5e9;">Run Another Audit</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: `SpendScan AI <${FROM_EMAIL}>`,
    to: lead.email,
    subject: `Your AI spend audit: $${summary.potentialAnnualSavings.toLocaleString()} in potential savings`,
    html,
  });
}

// ============================================================
// INTERNAL NOTIFICATION EMAIL (to team)
// ============================================================

export async function sendLeadNotificationEmail(lead: LeadData): Promise<void> {
  if (!CONTACT_EMAIL) return;

  await resend.emails.send({
    from: `SpendScan AI <${FROM_EMAIL}>`,
    to: CONTACT_EMAIL,
    subject: `New lead: ${lead.email} (${lead.role})`,
    html: `
      <h2>New Audit Lead</h2>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
      <p><strong>Company:</strong> ${lead.company || "N/A"}</p>
      <p><strong>Role:</strong> ${lead.role}</p>
      <p><strong>Team Size:</strong> ${lead.teamSize}</p>
      <p><strong>Monthly Spend:</strong> $${lead.totalMonthlySpend}</p>
      <p><strong>Potential Savings:</strong> $${lead.potentialSavings}/mo</p>
      <p><strong>Audit ID:</strong> ${lead.auditId}</p>
    `,
  });
}
