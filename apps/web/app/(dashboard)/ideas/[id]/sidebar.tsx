import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSingleIdea } from "@/actions/idea";
import UpdateIdea from "@/components/idea/core/edit-idea";
import { Button } from "@workspace/ui/components/button";
import DeleteIdea from "@/components/idea/core/delete-idea";
import { Separator } from "@workspace/ui/components/separator";
import { composio } from "@/lib/composio";
import { Badge } from "@workspace/ui/components/badge";
import moment from "moment";
import Image from "next/image";
import EditIntegration, {
  DeleteIntegration,
} from "@/components/idea/core/edit-integration";
import AddIdeaIntegrations from "@/components/idea/core/add-integration";

const IdeaSidebar = async ({ id }: { id: string }) => {
  const idea = await getSingleIdea(id);

  const connections = await composio.connectedAccounts.list({
    // userIds: [`idea-${id}`],
  });

  return (
    <div className="divide-y">
      <div className="p-4 flex items-center gap-4 justify-between">
        <h1 className="text-lg font-bold">Manage</h1>
        <div className="flex items-center gap-4">
          <UpdateIdea id={id} idea={idea}>
            <Button variant="outline" className="w-full">
              Edit
            </Button>
          </UpdateIdea>
          <DeleteIdea id={id} />
        </div>
      </div>
      <Separator />
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">Integrations</h1>
            <p className="text-sm font-muted-foreground">
              Manage all idea related integrations.
            </p>
          </div>
          <AddIdeaIntegrations id={id} />
        </div>
        <br />
        <div>
          {connections.items.map((item) => {
            return (
              <div className="mb-1 bg-muted p-1.5" key={item.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Image
                          height={14}
                          width={14}
                          src={`/logos/${item.toolkit.slug}.svg`}
                          alt={item.toolkit.slug || "Integration logo"}
                        />
                        <h1 className="capitalize font-bold">
                          {item.toolkit.slug}{" "}
                        </h1>
                      </div>
                      <Badge variant="neutral">
                        {item.status.toLocaleLowerCase()}
                      </Badge>
                    </div>
                    <span className="text-xs">
                      {moment(item.updatedAt).fromNow()}
                    </span>
                  </div>
                  <DeleteIntegration id={item.id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IdeaSidebar;
