import { Lightbulb } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { IdeasTable } from "./ideas-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import NewIdeaForm from "./new/new-idea";
import Header from "@/components/shared/header";
import { CommandSearch } from "@workspace/ui/components/command-search";
import { getSession } from "@/actions/account/user";
import { getAllIdeas } from "@/actions/idea";
import getQueryClient from "@/lib/query/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function IdeasPage() {
  const session = await getSession();

  const queryClient = getQueryClient();

  // Prefetch ideas data
  await queryClient.prefetchQuery({
    queryKey: ["ideas", session.org],
    queryFn: () => getAllIdeas(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header
        crumb={[
          {
            title: "All ideas",
          },
        ]}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"fancy"}>
              <Lightbulb className="mr-2 h-4 w-4" />
              New Idea
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto scrollbar-hide w-full sm:min-w-[540px]  max-w-2xl">
            <SheetHeader className="hidden">
              <SheetTitle>Create Your Million-Dollar Idea</SheetTitle>
              <SheetDescription>
                Great companies start with a vision. Use this form to shape and
                validate your next big idea.
              </SheetDescription>
            </SheetHeader>
            <NewIdeaForm />
          </SheetContent>
        </Sheet>
      </Header>
      <div className="container">
        <div className="space-y-4">
          <IdeasTable />
        </div>
      </div>
    </HydrationBoundary>
  );
}
