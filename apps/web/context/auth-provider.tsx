"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { client } from "@/lib/authClient";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      // @ts-ignore
      authClient={client}
      navigate={router.push}
      replace={router.replace}
      passkey
      social={{
        providers: ["google", "github"],
      }}
      onSessionChange={() => {
        router.refresh();
      }}
      // @ts-ignore
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
}
