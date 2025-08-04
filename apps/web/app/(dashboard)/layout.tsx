import { getSession } from "@/actions/account/user";
import { getSubscription } from "@/actions/account/subscription";
import { SessionProvider } from "@/context/session-context";
import Appbar from "@/components/sidebar/app-bar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LayoutContainer } from "@/components/layout-container";
import { LiveBlockProvider } from "@/components/liveblocks/provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect("/auth/sign-in");

  // Fetch session data and subscription in parallel
  const [sessionData, subscription] = await Promise.all([
    getSession(),
    getSubscription().catch(() => null), // Catch any errors and return null
  ]);

  // If no active subscription, redirect to checkout
  if (!subscription) {
    redirect("/checkout");
  }

  return (
    <SessionProvider sessionData={sessionData}>
      <LiveBlockProvider>
        <Appbar>
          <LayoutContainer>
            <main className="scrollbar-hide">{children}</main>
          </LayoutContainer>
        </Appbar>
      </LiveBlockProvider>
    </SessionProvider>
  );
}
