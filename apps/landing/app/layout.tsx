import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
          <Providers>
            <Navbar />
            {children}
            <Footer
              data={[
                {
                  title: "Product",
                  links: [
                    { label: "Home", link: "/" },
                    { label: "Features", link: "/features" },
                    {
                      label: "Idea Validation",
                      link: "/features/idea-validation",
                    },
                    {
                      label: "Visual Flow Builder",
                      link: "/features/visual-flow-builder",
                    },
                    {
                      label: "Project Management",
                      link: "/features/project-management",
                    },
                    { label: "AI Assistant", link: "/features/ai-assistant" },
                    {
                      label: "Launch Orchestration",
                      link: "/features/launch-orchestration",
                    },
                    {
                      label: "Public Roadmaps",
                      link: "/features/public-roadmaps",
                    },
                    {
                      label: "Analytics & Insights",
                      link: "/features/analytics-insights",
                    },
                    {
                      label: "Tech Stack Integration",
                      link: "/features/tech-stack-integration",
                    },
                    {
                      label: "Issue Tracking",
                      link: "/features/issue-tracking",
                    },
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
