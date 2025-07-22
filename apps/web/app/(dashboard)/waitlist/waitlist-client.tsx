"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllWaitlists, deleteWaitlist } from "@/actions/waitlist";
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
import { Settings, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@workspace/ui/components/separator";
import PageHeader from "@/components/shared/page-header";
import { useSession } from "@/context/session-context";
import { NoData } from "@/components/shared";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { toast } from "sonner";

export default function WaitlistClient() {
  const { org } = useSession();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // Use the prefetched data from React Query
  const { data: waitlistsResponse, isLoading } = useQuery({
    queryKey: ["waitlists", org],
    queryFn: () => getAllWaitlists(),
    select: (res) => (res?.success ? res.data : []),
  });

  // Delete waitlist mutation
  const deleteWaitlistMutation = useMutation({
    mutationFn: deleteWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlists", org] });
      toast.success("Waitlist deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete waitlist");
    },
  });

  const waitlists = waitlistsResponse || [];

  const handleDeleteWaitlist = async (
    waitlistId: string,
    waitlistName: string
  ) => {
    const isConfirmed = await confirm({
      title: "Delete Waitlist",
      description: `Are you sure you want to delete "${waitlistName}"? This action cannot be undone and will remove all associated entries.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (isConfirmed) {
      deleteWaitlistMutation.mutate(waitlistId);
    }
  };

  return (
    <div className="space-y-2">
      {/* Title and Description Section */}
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight">Waitlists</h1>
        <p className="text-muted-foreground">
          Manage your product waitlists, track signups, and engage with your
          audience before launch.
        </p>
      </div>

      <Separator />

      {isLoading ? (
        <div className="col-span-full flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : waitlists && waitlists.length > 0 ? (
        <div className="grid grid-cols-1 p-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {waitlists.map((waitlist: any) => (
            <Card key={waitlist.id} className="relative group">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {waitlist.name}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-1">
                  {waitlist.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge>{waitlist.stats?.totalEntries ?? 0} entries</Badge>
                  <Badge variant="secondary">
                    {waitlist.stats?.verifiedEntries ?? 0} verified
                  </Badge>
                  <Badge variant="outline">
                    {waitlist.stats?.totalReferrals ?? 0} referrals
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex  items-center gap-2">
                <Link href={`/waitlist/${waitlist.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Manage Waitlist
                    <Settings className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="error"
                  size="icon"
                  onClick={() =>
                    handleDeleteWaitlist(waitlist.id, waitlist.name)
                  }
                  disabled={deleteWaitlistMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mx-auto w-full py-16">
          <NoData />
        </div>
      )}
    </div>
  );
}
