import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./user-card";
import PageHeader from "@/components/shared/page-header";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]).catch(() => {
    throw redirect("/auth/sign-in");
  });

  //
  return (
    <>
      <PageHeader title="My Account" />
      <div className="container">
        <UserCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
      </div>
    </>
  );
}
