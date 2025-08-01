"use client";
import { BookOpenIcon, InfoIcon, LifeBuoyIcon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home" },
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Docs",
    href: "https://docs.rayai.dev",
  },
  {
    label: "Help",
    href: "/help",
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isScrolled && ""
      )}
    >
      <div
        className={cn(
          "flex items-center max-w-7xl mx-auto justify-between gap-4 px-4 md:px-6 transition-all duration-300 h-16",
          isScrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : ""
        )}
      >
        {/* Left side - Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-primary hover:text-primary/90 flex items-center gap-2"
          >
            <Image
              src="/icon.png"
              alt="Logo"
              width={isScrolled ? 32 : 32}
              height={isScrolled ? 32 : 32}
              className="transition-all duration-300"
            />
            <Badge>Beta</Badge>
          </Link>
        </div>

        {/* Center - Navigation menu (hidden on mobile) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <Link
                    href={link.href || ""}
                    className={cn(
                      "text-sm px-3 py-2 font-medium transition-colors",
                      isActive(link.href)
                        ? "text-primary font-semibold border-b-2 border-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Buttons and mobile menu */}
        <div className="flex items-center gap-2">
          {/* Desktop buttons (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="secondary" className="text-sm">
              <Link href="https://app.rayai.dev/auth/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="text-sm">
              <Link href="https://app.rayai.dev/auth/sign-up">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] pb-10 sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                {/* Navigation Links */}
                <nav className="flex-1 py-6">
                  <ul className="space-y-1">
                    {navigationLinks.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href || ""}
                          className={cn(
                            "block px-2 py-1.5 text-sm rounded-md transition-colors",
                            isActive(link.href)
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile buttons */}
                <div className="border-t pt-4 space-y-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Link href="https://rayai.dev/auth/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="https://app.rayai.dev/auth/sign-up">
                      Get Started
                    </Link>
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
