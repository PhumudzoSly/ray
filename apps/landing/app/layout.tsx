import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import CTA from "@/components/main/cta";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Ray - AI-Powered Product Management Tool",
    template: "%s | Ray AI",
  },
  description:
    "Ray is an AI-powered product management platform that accelerates your product development lifecycle. Validate ideas, create roadmaps, and streamline workflows with intelligent automation.",
  keywords: [
    "AI product management",
    "product roadmap tool",
    "idea validation software",
    "product development platform",
    "SaaS product management",
    "AI-powered planning",
    "product workflow automation",
    "startup product tools",
  ],
  authors: [
    {
      name: "Ray AI",
      url: "https://rayai.dev",
    },
  ],
  creator: "Ray AI",
  publisher: "Ray AI",
  metadataBase: new URL("https://rayai.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rayai.dev",
    title: "Ray - AI-Powered Product Management Tool",
    description:
      "Accelerate your product development with Ray's AI-powered management platform. From idea to launch, streamline your entire workflow.",
    siteName: "Ray AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ray - AI-Powered Product Management Tool",
    description:
      "Accelerate your product development with Ray's AI-powered management platform. From idea to launch, streamline your entire workflow.",
    creator: "@rayai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.className} ${GeistMono.variable} font-sans antialiased `}
      >
        <Providers>
          <Navbar />
          {children}
          <CTA />
          <Toaster richColors />
          <Analytics />
          <SpeedInsights />
          <Footer
            data={[
              {
                title: "Product",
                links: [
                  { label: "Home", link: "/" },
                  { label: "Features", link: "/features" },
                  { label: "Pricing", link: "/pricing" },
                ],
              },
              {
                title: "Help",
                links: [
                  { label: "Help Center", link: "/help" },
                  { label: "Docs", link: "https://docs.rayai.dev" },
                ],
              },
            ]}
          />
        </Providers>
      </body>
    </html>
  );
}
