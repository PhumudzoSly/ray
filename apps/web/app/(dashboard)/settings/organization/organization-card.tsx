"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  organization,
  useActiveOrganization,
  useBetterAuthSession,
} from "@/lib/authClient";
import { Session } from "@/lib/auth-types";
import {
  Building2,
  Loader2,
  MailPlus,
  MoreVertical,
  Plus,
  Settings,
  Shield,
  UserMinus,
  UserPlus,
  Users,
  Copy,
  Check,
  Crown,
  UserCheck,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import CopyButton from "@workspace/ui/components/copy-button";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useRouter } from "next/navigation";
import { getCurrentOrg } from "@/actions/account/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { OrganizationSettingsDialog } from "./organization-setting-dialog";
import { Separator } from "@workspace/ui/components/separator";

export function OrganizationCard(props: { session: Session | null }) {
  const router = useRouter();
  const [isRevoking, setIsRevoking] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeOrg, setActiveOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const data = await getCurrentOrg();
        setActiveOrg(data);
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  const { data } = useBetterAuthSession.get();
  const session = data || props.session;

  const currentMember = activeOrg?.members.find(
    (member: any) => member.userId === session?.user.id
  );

  const pendingInvitations = activeOrg?.invitations.filter(
    (invitation: any) => invitation.status === "pending"
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading organization...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                  <AvatarImage
                    className="object-cover"
                    src={activeOrg?.logo || ""}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-semibold">
                    {activeOrg?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {activeOrg?.name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {activeOrg?.members.length || 1}{" "}
                      {activeOrg?.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Organization</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeOrg?.id && (
                <InviteMemberDialog
                  activeOrg={activeOrg}
                  onMemberInvited={async () => {
                    const data = await getCurrentOrg();
                    setActiveOrg(data);
                  }}
                />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="h-4 w-4 mr-3" />
                    Organization Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members & Invitations */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 px-6"
              >
                <Users className="h-4 w-4" />
                Members
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeOrg?.members.length || 1}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="invites"
                className="flex items-center gap-2 px-6"
              >
                <Mail className="h-4 w-4" />
                Invitations
                {pendingInvitations?.length ? (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {pendingInvitations.length}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    0
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-6">
              <div className="space-y-1">
                {activeOrg?.members.map((member: any, index: number) => (
                  <div
                    key={member.id}
                    className="group flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={member.user.image || ""}
                            alt={member.user.name || ""}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-medium">
                            {member.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {member.role === "owner" && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full border-2 border-background flex items-center justify-center">
                            <Crown className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {member.user.name}
                          </p>
                          {member.userId === session?.user.id && (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              member.role === "owner" ? "default" : "secondary"
                            }
                            className="text-xs px-2 py-0 font-medium"
                          >
                            {member.role === "owner" && (
                              <Crown className="h-3 w-3 mr-1" />
                            )}
                            {member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {member.role !== "owner" &&
                      (currentMember?.role === "owner" ||
                        currentMember?.role === "admin") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                          onClick={async () => {
                            try {
                              await organization.removeMember({
                                memberIdOrEmail: member.id,
                              });
                              const data = await getCurrentOrg();
                              setActiveOrg(data);
                              toast.success(
                                `${member.user.name} has been removed from the organization`
                              );
                            } catch (error) {
                              toast.error("Failed to remove member");
                              console.error("Failed to remove member:", error);
                            }
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          {currentMember?.id === member.id ? "Leave" : "Remove"}
                        </Button>
                      )}
                  </div>
                ))}

                {!activeOrg?.id && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-accent/30">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session?.user.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-medium">
                          {session?.user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {session?.user.name}
                        </p>
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          You
                        </Badge>
                      </div>
                      <Badge
                        variant="default"
                        className="text-xs px-2 py-0 font-medium"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invites" className="mt-6">
              <div className="space-y-1">
                {pendingInvitations?.map((invitation: any) => (
                  <div
                    key={invitation.id}
                    className="group flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-700 font-medium">
                          {invitation.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {invitation.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0 font-medium"
                          >
                            {invitation.role.charAt(0).toUpperCase() +
                              invitation.role.slice(1)}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton
                        textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                      />
                      <Button
                        disabled={isRevoking.includes(invitation.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                        onClick={() => {
                          organization.cancelInvitation(
                            {
                              invitationId: invitation.id,
                            },
                            {
                              onRequest: () => {
                                setIsRevoking([...isRevoking, invitation.id]);
                              },
                              onSuccess: async () => {
                                toast.success("Invitation revoked");
                                setIsRevoking(
                                  isRevoking.filter(
                                    (id) => id !== invitation.id
                                  )
                                );
                                const data = await getCurrentOrg();
                                setActiveOrg(data);
                              },
                              onError: (ctx) => {
                                toast.error(ctx.error.message);
                                setIsRevoking(
                                  isRevoking.filter(
                                    (id) => id !== invitation.id
                                  )
                                );
                              },
                            }
                          );
                        }}
                      >
                        {isRevoking.includes(invitation.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Revoke"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {(!activeOrg?.invitations ||
                  activeOrg.invitations.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No pending invitations
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Invite team members to collaborate on your organization
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {activeOrg && (
        <OrganizationSettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          currentName={activeOrg.name}
          storeId={activeOrg.id}
        />
      )}
    </div>
  );
}

function InviteMemberDialog({
  activeOrg,
  onMemberInvited,
}: {
  activeOrg: any;
  onMemberInvited: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-9 px-4">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Invite Team Member</DialogTitle>
          <DialogDescription className="text-base">
            Send an invitation to collaborate in your organization. They'll
            receive an email with instructions to join.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              placeholder="colleague@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="h-10">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">
                        Can manage members and settings
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-xs text-muted-foreground">
                        Can view and contribute to projects
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            disabled={loading || !email}
            onClick={async () => {
              setLoading(true);
              const invite = organization.inviteMember({
                email: email,
                role: role as "member",
                fetchOptions: {
                  throw: true,
                  onSuccess: async () => {
                    if (activeOrg) {
                      await onMemberInvited();
                    }
                    setOpen(false);
                    setEmail("");
                    setRole("member");
                  },
                },
              });
              toast.promise(invite, {
                loading: "Sending invitation...",
                success: "Invitation sent successfully",
                error: "Failed to send invitation",
              });
              setLoading(false);
            }}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
