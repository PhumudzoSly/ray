import "@workspace/ui/globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@workspace/ui/components/sonner";
import { ThemeProvider } from "@/context/theme-provider";
import { ConvexClientProvider } from "@/context/convex-provider";
import { AuthProvider } from "@/context/auth-provider";
import { cn } from "@/lib/utils";
import { ConfirmDialogProvider } from "@workspace/ui/components/confirm-dialog";

const inter = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "800"],
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
      <body className={cn(inter.className, "antialiased")}>
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
