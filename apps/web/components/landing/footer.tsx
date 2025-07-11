import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Facebook, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";

interface FooterLinksProps {
  data: {
    title: string;
    links: { label: string; link: string }[];
  }[];
}

const socialLinks = [
  {
    icon: <Twitter className="size-4" />,
    href: "https://x.com/rayai_app",
    label: "Twitter",
  },
  {
    icon: <Facebook className="size-4" />,
    href: "https://facebook.com/rayaiapp",
    label: "Facebook",
  },
];

const Footer = ({ data }: FooterLinksProps) => {
  const footerGroups = data.map((group) => (
    <div key={group.title} className="space-y-3">
      <h3 className="font-semibold tracking-tight">{group.title}</h3>
      <ul className="space-y-3">
        {group.links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.link}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ));

  return (
    <footer className="relative overflow-hidden border-t border-t-card">
      <div className="absolute inset-0 bg-grid-white/10 " />
      <div className="container relative px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/icon.png" alt="Ray AI Logo" className="h-8 w-auto" />
              <span className="text-lg font-bold">Ray AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Validate your ideas the right way, create projects, manage
              features, get feedback from users and stick the marketing &
              launching part right.
            </p>
          </div>

          {footerGroups}

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Payments by Polar</h4>
              <p className="text-xs text-muted-foreground">
                We do not store any payment details. All payments are securely
                handled by{" "}
                <a href="https://polar.sh" className="underline">
                  Polar
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ray AI. A Reavize Product - All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
