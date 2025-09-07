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

export const metadata: Metadata = {
  title: "Ray - AI-powered Product Management",
  description:
    "Ray is an AI-powered product management tool that helps you build better products faster. From idea validation to roadmap planning, Ray streamlines your product development workflow.",
  keywords: [
    "AI",
    "Product Management",
    "Roadmap",
    "Idea Validation",
    "Product Development",
    "SaaS",
  ],
  authors: [
    {
      name: "Ray AI",
    },
  ],
  creator: "Ray AI",
  publisher: "Ray AI",
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
