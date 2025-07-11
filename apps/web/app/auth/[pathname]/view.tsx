"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";
import { DEFAULT_LOGIN_REDIRECT } from "@/utils/config";

export function AuthView({ pathname }: { pathname: string }) {
  return (
    <section className="container flex grow flex-col items-center justify-center gap-3 self-center">
      <AuthCard
        redirectTo={DEFAULT_LOGIN_REDIRECT}
        socialLayout="horizontal"
        pathname={pathname}
      />
    </section>
  );
}
