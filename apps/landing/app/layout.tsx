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
