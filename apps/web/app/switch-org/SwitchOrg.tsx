"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { organization } from "@/lib/authClient";
import {
  getMyOrgs,
  getInvitations,
  acceptInvitation,
} from "@/actions/account/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Mail, Users } from "lucide-react";
import CreateOrg from "./CreateOrg";

interface SwitchOrgProps {
  orgs: Awaited<ReturnType<typeof getMyOrgs>> | undefined;
  invitations: Awaited<ReturnType<typeof getInvitations>> | undefined;
}

function SwitchOrg({ orgs, invitations }: SwitchOrgProps) {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingInvitation, setAcceptingInvitation] = useState<string | null>(
    null
  );

  const handleSwitchOrg = async () => {
    if (!selectedOrg) return;

    setIsLoading(true);
    try {
      await organization.setActive({ organizationId: selectedOrg });
      toast.success("Organisation switched successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Error switching organisation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setAcceptingInvitation(invitationId);
    try {
      await acceptInvitation(invitationId);
      toast.success("Invitation accepted successfully");
      router.refresh(); // Refresh to get updated data
    } catch (error) {
      console.error(error);
      toast.error("Error accepting invitation");
    } finally {
      setAcceptingInvitation(null);
    }
  };

  const hasOrgs = orgs && orgs.length > 0;
  const hasInvitations = invitations && invitations.length > 0;

  // If user has no organizations, show simplified view
  if (!hasOrgs) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Organisation</CardTitle>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first organisation.
            </p>
          </CardHeader>
          <CardContent>
            <CreateOrg orgSwitch />

            {hasInvitations && (
              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <Mail className="w-4 h-4 mr-2" />
                  <h3 className="font-medium">Pending Invitations</h3>
                  <Badge variant="secondary" className="ml-2">
                    {invitations.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {invitation.organization.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Role: {invitation.role}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleAcceptInvitation(invitation.id)}
                          disabled={acceptingInvitation === invitation.id}
                          size="sm"
                        >
                          {acceptingInvitation === invitation.id
                            ? "Accepting..."
                            : "Accept"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has organizations, show the existing tabbed UI
  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Organisations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new organisation, select an existing one, or accept an
            invitation to continue.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="select">
                <Users className="w-4 h-4 mr-1" />
                Select
              </TabsTrigger>
              <TabsTrigger value="invitations" className="relative">
                <Mail className="w-4 h-4 mr-1" />
                Invitations
                {hasInvitations && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 w-5 p-0 text-xs"
                  >
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              <Select onValueChange={setSelectedOrg} value={selectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organisation" />
                </SelectTrigger>
                <SelectContent>
                  {orgs?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleSwitchOrg}
                disabled={!selectedOrg || isLoading}
                className="w-full"
              >
                {isLoading ? "Switching..." : "Continue"}
              </Button>
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              {hasInvitations ? (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {invitation.organization.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Role: {invitation.role}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleAcceptInvitation(invitation.id)}
                          disabled={acceptingInvitation === invitation.id}
                          size="sm"
                        >
                          {acceptingInvitation === invitation.id
                            ? "Accepting..."
                            : "Accept"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No invitations</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any pending organisation invitations.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="create">
              <CreateOrg />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default SwitchOrg;
