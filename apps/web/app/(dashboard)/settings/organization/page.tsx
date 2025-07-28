import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrganizationCard } from "./organization-card";
import { auth } from "@/lib/auth";
import PageHeader from "@/components/shared/page-header";

export default async function Organisations() {
  const [session] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
  ]).catch(() => {
    throw redirect("/auth/sign-in");
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Organization" />
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrganizationCard session={JSON.parse(JSON.stringify(session))} />
      </div>
    </div>
  );
}
