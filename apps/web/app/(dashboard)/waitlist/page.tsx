import { getAllWaitlists } from "@/actions/waitlist";
import WaitlistClient from "./waitlist-client";
import getQueryClient from "@/lib/query/getQueryClient";
import Header from "@/components/shared/header";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import { getSession } from "@/actions/account/user";

export default async function WaitlistPage() {
  const queryClient = getQueryClient();
  const { org } = await getSession();

  // Prefetch the waitlists data
  await queryClient.prefetchQuery({
    queryKey: ["waitlists", org],
    queryFn: () => getAllWaitlists(),
  });

  return (
    <div>
      <Header crumb={[{ title: "Waitlists", url: "/waitlist" }]}>
        <Link href="/waitlist/new">
          <Button size="sm" variant="fancy">
            <Plus className="w-4 h-4 mr-2" /> New Waitlist
          </Button>
        </Link>
      </Header>
      <WaitlistClient />
    </div>
  );
}
