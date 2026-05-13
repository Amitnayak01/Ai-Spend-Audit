// ============================================================
// CORE TYPES - AI Spend Audit SaaS
// ============================================================

export type AITool =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf"
  | "v0"
  | "perplexity"
  | "midjourney"
  | "other";

export type ToolPlan =
  | "free"
  | "pro"
  | "team"
  | "enterprise"
  | "pay-as-you-go"
  | "custom";

export type UseCase =
  | "coding"
  | "writing"
  | "research"
  | "design"
  | "customer-support"
  | "data-analysis"
  | "api-integration"
  | "other";

export interface ToolEntry {
  id: string;
  tool: AITool;
  plan: ToolPlan;
  monthlySpend: number;
  seats: number;
  useCase: UseCase;
  customToolName?: string;
}

export interface AuditFormData {
  // Step 1: Team info
  teamSize: number;
  industry: string;
  companyName?: string;

  // Step 2: Tools
  tools: ToolEntry[];

  // Step 3: Lead capture
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

// ============================================================
// AUDIT ENGINE TYPES
// ============================================================

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export interface Recommendation {
  id: string;
  toolId: string;
  tool: AITool;
  type:
    | "downgrade"
    | "switch-tool"
    | "reduce-seats"
    | "bundle"
    | "eliminate"
    | "optimize";
  title: string;
  description: string;
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
  annualSavings: number;
  confidence: number; // 0-100
  severity: SeverityLevel;
  actionItems: string[];
  alternativeTool?: string;
  reason: string;
}

export interface AuditResult {
  id: string;
  createdAt: Date;
  formData: AuditFormData;
  summary: {
    totalMonthlySpend: number;
    totalAnnualSpend: number;
    potentialMonthlySavings: number;
    potentialAnnualSavings: number;
    savingsPercentage: number;
    toolCount: number;
    redundantTools: string[];
    efficiency: "excellent" | "good" | "fair" | "poor";
  };
  recommendations: Recommendation[];
  aiSummary: string;
  shareId?: string;
}

// ============================================================
// API TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role: string;
  teamSize: number;
  totalMonthlySpend: number;
  potentialSavings: number;
  auditId: string;
}

export interface SharedReport {
  shareId: string;
  auditId: string;
  createdAt: Date;
  expiresAt: Date;
  viewCount: number;
  sanitizedData: Partial<AuditResult>;
}

// ============================================================
// TOOL METADATA
// ============================================================

export interface ToolMetadata {
  id: AITool;
  name: string;
  logo?: string;
  category: "coding" | "writing" | "general" | "design" | "api";
  plans: {
    id: ToolPlan;
    name: string;
    monthlyPricePerSeat: number;
    features?: string[];
  }[];
  website: string;
}

// ============================================================
// FORM STEP CONFIG
// ============================================================

export interface FormStep {
  id: number;
  title: string;
  description: string;
  fields: string[];
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: "Your Team",
    description: "Tell us about your team size and industry",
    fields: ["teamSize", "industry", "companyName"],
  },
  {
    id: 2,
    title: "AI Tools",
    description: "Add all the AI tools your team currently uses",
    fields: ["tools"],
  },
  {
    id: 3,
    title: "Get Results",
    description: "Enter your email to receive your personalized audit",
    fields: ["email", "role", "firstName", "lastName"],
  },
];
