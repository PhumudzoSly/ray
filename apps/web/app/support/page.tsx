import React from "react";
import PageHeader from "@/components/shared/page-header";
import { getSession } from "@/actions/account/user";
import { SupportForm } from "./_components/support-form";

export default async function SupportPage() {
  const session = await getSession();

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <PageHeader title="Support" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Hi {session.name}! 👋</h2>
        <p className="text-muted-foreground">How can we assist you today?</p>
      </div>
      <SupportForm session={session} />
    </div>
  );
}
