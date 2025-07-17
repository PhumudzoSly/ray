"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useSession } from "@/context/session-context";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ValidationOverview } from "@/components/idea/validation/validation-overview";
import { useQuery } from "@tanstack/react-query";

interface IdeaDetailsContentProps {
  ideaId: string;
}

export const IdeaDetailsContent: React.FC<IdeaDetailsContentProps> = ({
  ideaId,
}) => {
  const { token } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // const { data: idea, isPending: ideaPending } = useQuery({
  //   queryKey: ["idea", ideaId],
  //   queryFn: () => api.idea.getSingleIdea({ id: ideaId as Id<"idea">, token }),
  // });

  // const { data: validationDetails, isPending: validationPending } = useQuery({
  //   queryKey: ["validationDetails", ideaId],
  //   queryFn: () => api.idea.getValidationDetails({ token, ideaId: ideaId as Id<"idea"> }),
  // });

  // if (ideaPending || validationPending) {
  //   return (
  //     <div className="flex-1 overflow-auto">
  //       <div className="container mx-auto px-4 py-6 space-y-6">
  //         <div className="space-y-4">
  //           <div className="flex gap-2 border-b">
  //             {Array.from({ length: 8 }).map((_, i) => (
  //               <Skeleton key={i} className="h-10 w-24" />
  //             ))}
  //           </div>

  //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //             {Array.from({ length: 4 }).map((_, i) => (
  //               <Card key={i}>
  //                 <CardHeader>
  //                   <Skeleton className="h-6 w-32" />
  //                   <Skeleton className="h-4 w-48" />
  //                 </CardHeader>
  //                 <CardContent>
  //                   <div className="space-y-3">
  //                     <Skeleton className="h-4 w-full" />
  //                     <Skeleton className="h-4 w-5/6" />
  //                     <Skeleton className="h-4 w-4/6" />
  //                   </div>
  //                 </CardContent>
  //               </Card>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!idea) {
  //   return (
  //     <div className="flex-1 overflow-auto">
  //       <div className="container mx-auto px-4 py-6">
  //         <Card>
  //           <CardContent className="flex items-center justify-center h-64">
  //             <p className="text-muted-foreground">Idea not found</p>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  // const hasValidation = validationDetails && validationDetails.validation;

  return (
    <div className="flex-1 overflow-auto">
      {/* <ValidationOverview idea={idea} validationDetails={validationDetails} /> */}
    </div>
  );
};
