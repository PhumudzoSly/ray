"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const mainLinks = [
  {
    label: "Features",
    link: "/features",
  },
  {
    label: "Pricing",
    link: "/pricing",
  },
  {
    label: "Help",
    link: "/help",
  },
  {
    label: "Docs",
    link: "https://docs.rayai.dev",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        isScrolled
          ? "bg-background border-border"
          : "bg-background/80 backdrop-blur-xl border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/icon.png" alt="Ray AI Logo" className="h-8 w-auto" />
            <Badge variant="info">Beta</Badge>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {mainLinks.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.link
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button asChild className="hidden md:flex" variant={"outline"}>
            <Link href="https://app.rayai.dev/auth/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="hidden md:flex">
            <Link href="https://app.rayai.dev/auth/sign-up">Get Started</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <div className="flex flex-col gap-4 p-6">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => document.body.click()}
                >
                  <img
                    src="/icon.png"
                    alt="Ray AI Logo"
                    className="h-8 w-auto"
                  />
                  <span className="text-lg font-bold">Ray AI</span>
                </Link>
                <div className="flex flex-col space-y-3">
                  {mainLinks.map((item) => (
                    <Link
                      key={item.link}
                      href={item.link}
                      className={`text-sm transition-colors hover:text-primary ${
                        pathname === item.link
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild className="w-full">
                    <a href="https://getwaitlist.com/waitlist/25597">
                      Get Started
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
