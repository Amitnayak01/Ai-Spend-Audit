import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
// @ts-ignore: CSS module type declarations not available in this project setup
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://spendscan.ai";

export const metadata: Metadata = {
  title: {
    default: "SpendScan AI — Find Hidden Savings in Your AI Tool Stack",
    template: "%s | SpendScan AI",
  },
  description:
    "Audit your AI tool spending in 2 minutes. Get personalized recommendations to cut costs 20-40% without losing productivity.",
  keywords: [
    "AI tools", "SaaS spending", "AI cost optimization", "Cursor", "ChatGPT",
    "GitHub Copilot", "Claude", "AI budget", "software audit",
  ],
  authors: [{ name: "SpendScan AI" }],
  creator: "SpendScan AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "SpendScan AI",
    title: "SpendScan AI — Find Hidden Savings in Your AI Tool Stack",
    description:
      "Teams spend 34% more than they need to on AI tools. Find out where your money is going.",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SpendScan AI - AI Spend Audit Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendScan AI — Find Hidden Savings in Your AI Tool Stack",
    description:
      "Teams spend 34% more than they need to on AI tools. Find out where your money is going.",
    images: [`${APP_URL}/og-image.png`],
    creator: "@spendscanai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: "var(--font-sans)" },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}