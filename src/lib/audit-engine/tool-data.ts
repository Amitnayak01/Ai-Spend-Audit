import type { ToolMetadata, AITool } from "@/types";

export const TOOL_METADATA: Record<AITool, ToolMetadata> = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    website: "https://cursor.sh",
    plans: [
      { id: "free", name: "Hobby", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Pro", monthlyPricePerSeat: 20 },
      { id: "team", name: "Business", monthlyPricePerSeat: 40 },
    ],
  },
  "github-copilot": {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding",
    website: "https://github.com/features/copilot",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Individual", monthlyPricePerSeat: 10 },
      { id: "team", name: "Business", monthlyPricePerSeat: 19 },
      { id: "enterprise", name: "Enterprise", monthlyPricePerSeat: 39 },
    ],
  },
  claude: {
    id: "claude",
    name: "Claude (claude.ai)",
    category: "general",
    website: "https://claude.ai",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Pro", monthlyPricePerSeat: 20 },
      { id: "team", name: "Team", monthlyPricePerSeat: 25 },
      { id: "enterprise", name: "Enterprise", monthlyPricePerSeat: 60 },
    ],
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    category: "general",
    website: "https://chat.openai.com",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Plus", monthlyPricePerSeat: 20 },
      { id: "team", name: "Team", monthlyPricePerSeat: 25 },
      { id: "enterprise", name: "Enterprise", monthlyPricePerSeat: 60 },
    ],
  },
  "anthropic-api": {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    website: "https://anthropic.com",
    plans: [
      { id: "pay-as-you-go", name: "Pay As You Go", monthlyPricePerSeat: 0 },
    ],
  },
  "openai-api": {
    id: "openai-api",
    name: "OpenAI API",
    category: "api",
    website: "https://openai.com",
    plans: [
      { id: "pay-as-you-go", name: "Pay As You Go", monthlyPricePerSeat: 0 },
    ],
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    category: "general",
    website: "https://gemini.google.com",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Gemini Advanced", monthlyPricePerSeat: 19.99 },
      { id: "team", name: "Workspace", monthlyPricePerSeat: 30 },
    ],
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    website: "https://windsurf.ai",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Pro", monthlyPricePerSeat: 15 },
      { id: "team", name: "Teams", monthlyPricePerSeat: 35 },
    ],
  },
  v0: {
    id: "v0",
    name: "v0 by Vercel",
    category: "design",
    website: "https://v0.dev",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Premium", monthlyPricePerSeat: 20 },
    ],
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    category: "general",
    website: "https://perplexity.ai",
    plans: [
      { id: "free", name: "Free", monthlyPricePerSeat: 0 },
      { id: "pro", name: "Pro", monthlyPricePerSeat: 20 },
    ],
  },
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    category: "design",
    website: "https://midjourney.com",
    plans: [
      { id: "pro", name: "Basic", monthlyPricePerSeat: 10 },
      { id: "team", name: "Standard", monthlyPricePerSeat: 30 },
      { id: "enterprise", name: "Pro", monthlyPricePerSeat: 60 },
    ],
  },
  other: {
    id: "other",
    name: "Other AI Tool",
    category: "general",
    website: "#",
    plans: [
      { id: "custom", name: "Custom", monthlyPricePerSeat: 0 },
    ],
  },
};

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Software / SaaS",
  "Finance & Fintech",
  "Healthcare",
  "E-commerce & Retail",
  "Marketing & Advertising",
  "Education",
  "Legal",
  "Consulting",
  "Media & Entertainment",
  "Manufacturing",
  "Real Estate",
  "Other",
];

export const ROLE_OPTIONS = [
  "Founder / CEO",
  "CTO / VP Engineering",
  "Engineering Manager",
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Marketing Manager",
  "Data Scientist / Analyst",
  "Finance / Operations",
  "Other",
];
