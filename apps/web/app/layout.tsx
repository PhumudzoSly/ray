import "@workspace/ui/globals.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/attributes.css";
import "@liveblocks/react-blocknote/styles.css";
import type { Metadata } from "next";
import { Toaster } from "@workspace/ui/components/sonner";
import { ThemeProvider } from "@/context/theme-provider";
import { ConfirmDialogProvider } from "@workspace/ui/components/confirm-dialog";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import ReactQueryProvider from "@/lib/query/provider";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/query/getQueryClient";

export const metadata: Metadata = {
  title: "Ray AI - Build SaaS that users want and love.",
  description: "Design structured app flows with AI-generated PRDs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = getQueryClient();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased `}>
        <ReactQueryProvider>
          <HydrationBoundary state={dehydrate(client)}>
            <ThemeProvider
              storageKey="rayai-theme"
              attribute="class"
              nonce="b1282rp=1ed2h3od12ndu2boqjdh1ibuo2i3hn"
              defaultTheme="light"
            >
              <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
              <Toaster richColors />
            </ThemeProvider>
          </HydrationBoundary>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
