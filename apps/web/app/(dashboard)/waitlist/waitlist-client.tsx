"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllWaitlists } from "@/actions/waitlist";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Settings, Plus } from "lucide-react";
import Link from "next/link";
import { Separator } from "@workspace/ui/components/separator";
import PageHeader from "@/components/shared/page-header";
import { useSession } from "@/context/session-context";
import { NoData } from "@/components/shared";

export default function WaitlistClient() {
  // Use the prefetched data from React Query
  const { org } = useSession();
  const { data: waitlistsResponse, isLoading } = useQuery({
    queryKey: ["waitlists", org],
    queryFn: () => getAllWaitlists(),
    select: (res) => (res?.success ? res.data : []),
  });

  const waitlists = waitlistsResponse || [];

  return (
    <>
      {isLoading ? (
        <div className="col-span-full flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : waitlists && waitlists.length > 0 ? (
        waitlists.map((waitlist: any) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card key={waitlist.id}>
              <CardHeader>
                <CardTitle>{waitlist.name}</CardTitle>
                <CardDescription>{waitlist.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge>{waitlist.stats?.totalEntries ?? 0} entries</Badge>
                  <Badge>{waitlist.stats?.verifiedEntries ?? 0} verified</Badge>
                  <Badge>{waitlist.stats?.totalReferrals ?? 0} referrals</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/waitlist/${waitlist.id}`}>
                  <Button variant="outline" size="sm">
                    Manage <Settings className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        ))
      ) : (
        <div className="mx-auto w-full py-16">
          <NoData />
        </div>
      )}
    </>
  );
}
