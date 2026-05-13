import { Metadata } from "next";
import SharedReportClient from "./SharedReportClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://spendscan.ai";

  try {
    const res = await fetch(`${APP_URL}/api/share?shareId=${params.id}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    if (data.success && data.data) {
      const { summary } = data.data;
      const title = `AI Spend Audit — $${summary.potentialAnnualSavings.toLocaleString()}/yr savings found`;
      const description = `This team is spending $${summary.totalMonthlySpend.toLocaleString()}/mo on ${summary.toolCount} AI tools. SpendScan found $${summary.potentialMonthlySavings.toLocaleString()}/mo in savings.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: "website",
          url: `${APP_URL}/share/${params.id}`,
          images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  } catch {}

  return {
    title: "Shared AI Spend Report | SpendScan AI",
    description: "View this team's AI tool spend audit results.",
  };
}

export default function SharedReportPage({ params }: Props) {
  return <SharedReportClient shareId={params.id} />;
}
