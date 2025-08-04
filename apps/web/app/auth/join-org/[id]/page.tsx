import { getSingleInvitation } from "@/actions/account/user";
import React from "react";
import Join from "./Join";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Building2, Mail, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

const JoinOrganization = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const invite = await getSingleInvitation(id);

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired. Please contact the
              organization administrator for a new invitation.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Join Organization</CardTitle>
            <p className="text-muted-foreground text-sm">
              You've been invited to collaborate
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50 border">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${invite.organization.name}`}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {invite.organization.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {invite.organization.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Invited as
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {invite.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Invitation Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Invited to:</span>
                <span className="font-medium">{invite.email}</span>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-center">
              By joining{" "}
              <span className="font-semibold">{invite.organization.name}</span>,
              you'll be able to collaborate on projects, share resources, and
              work together as a team.
            </p>
          </div>

          {/* Action Button */}
          <Join id={id} organizationName={invite.organization.name} />

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinOrganization;
