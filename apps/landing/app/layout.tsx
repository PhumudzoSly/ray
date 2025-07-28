import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import { Toaster } from "sonner";

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
          <Toaster richColors />
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
