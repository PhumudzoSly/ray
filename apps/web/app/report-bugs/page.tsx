import React from "react";
import PageHeader from "@/components/shared/page-header";
import { getSession } from "@/actions/account/user";
import { BugReportForm } from "./_components/bug-report-form";

export default async function ReportBugsPage() {
  const session = await getSession();

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <PageHeader title="Report a Bug" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Hi {session.name}! 🐛</h2>
        <p className="text-muted-foreground">
          Found something that needs fixing? Let us know the details below.
        </p>
      </div>
      <BugReportForm session={session} />
    </div>
  );
}
