"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
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
import {
  ExternalLink,
  Settings,
  Copy,
  Users,
  TrendingUp,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { Separator } from "@workspace/ui/components/separator";
import PageHeader from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { useData } from "@/hooks/use-data";
import Header from "@/components/shared/header";
import NoData from "@/components/shared/no-data";

export default function WaitlistPage() {
  const { token } = useSession();
  // Fetch waitlists
  const { data: waitlists, isPending } = useData(
    api.waitlists.getAllWaitlists,
    {
      token,
    }
  );

  return (
    <>
      <Header crumb={[{ title: "Waitlist", url: "/waitlist" }]}>
        <Button asChild className="shrink-0" variant="fancy">
          <Link href="/waitlist/new">
            <Plus /> Create Waitlist
          </Link>
        </Button>
      </Header>
      <div className="container">
        <div className="flex px-4 py-2 items-center flex-wrap gap-4 justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Waitlists</h2>
            <p className="text-muted-foreground text-sm">
              Build anticipation and collect early users for your projects
            </p>
          </div>
        </div>
        <Separator />

        {/* Waitlist Grid */}
        {waitlists === undefined || isPending ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : waitlists === null || waitlists?.length === 0 ? (
          <NoData title="No waitlist" message="" />
        ) : (
          waitlists?.map((waitlist: any) => {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card key={waitlist._id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">
                      <div className="flex items-center justify-between gap-4">
                        <h6 className="truncate whitespace-pre-wrap line-clamp-1">
                          {waitlist.name}
                        </h6>

                        <Badge
                          variant={waitlist.isPublic ? "default" : "secondary"}
                          className={
                            waitlist.isPublic
                              ? "bg-primary/10 text-primary border-primary/20"
                              : ""
                          }
                        >
                          {waitlist.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {waitlist.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{waitlist.project?.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {waitlist.stats ? (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col border border-border rounded-md px-4 py-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Total
                          </span>
                          <span className="text-2xl font-bold">
                            {waitlist.stats.totalEntries}
                          </span>
                        </div>
                        <div className="flex flex-col border border-border rounded-md px-4 py-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Verified
                          </span>
                          <span className="text-2xl font-bold">
                            {waitlist.stats.verifiedEntries}
                          </span>
                        </div>
                        <div className="flex flex-col border border-border rounded-md px-4 py-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Referrals
                          </span>
                          <span className="text-2xl font-bold">
                            {waitlist.stats.totalReferrals}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 border-t pt-4">
                      <Users className="w-4 h-4" />
                      <span className="font-mono">/{waitlist.slug}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-auto"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/wl/${waitlist.slug}`
                          );
                          toast.success("URL copied to clipboard");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/wl/${waitlist.slug}`}
                        target="_blank"
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Public
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href={`/waitlist/${waitlist._id}`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
