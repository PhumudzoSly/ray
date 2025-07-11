import { getSession } from "@/actions/account/user";
import { SessionProvider } from "@/context/session-context";
import Appbar from "@/components/sidebar/app-bar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { LayoutContainer } from "@/components/layout-container";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect("/auth/sign-in");

  const sessionData = await getSession();

  return (
    <SessionProvider sessionData={sessionData}>
      <Appbar>
        <LayoutContainer>
          <main className="scrollbar-hide">{children}</main>
        </LayoutContainer>
      </Appbar>
    </SessionProvider>
  );
}
