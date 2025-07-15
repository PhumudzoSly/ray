import "@workspace/ui/globals.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/attributes.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@workspace/ui/components/sonner";
import { ThemeProvider } from "@/context/theme-provider";
import { ConvexClientProvider } from "@/context/convex-provider";
import { AuthProvider } from "@/context/auth-provider";
import { cn } from "@/lib/utils";
import { ConfirmDialogProvider } from "@workspace/ui/components/confirm-dialog";
import { Geist, Geist_Mono } from "next/font/google";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ray AI - Build SaaS that users want and love.",
  description: "Design structured app flows with AI-generated PRDs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <AuthProvider>
          <ThemeProvider
            storageKey="rayai-theme"
            attribute="class"
            nonce="b1282rp=1ed2h3od12ndu2boqjdh1ibuo2i3hn"
            defaultTheme="dark"
          >
            <ConvexClientProvider>
              <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
              <Toaster />
            </ConvexClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
