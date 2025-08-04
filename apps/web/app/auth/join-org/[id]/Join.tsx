"use client";
import { acceptInvitation } from "@/actions/account/user";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { client } from "@/lib/authClient";

interface JoinProps {
  id: string;
  organizationName: string;
}

const Join = ({ id, organizationName }: JoinProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { error, data } = await client.organization.acceptInvitation({
      invitationId: id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success(`Successfully joined ${organizationName}!`);

      // Delay navigation to show success state
      setTimeout(() => {
        router.replace("/switch-org");
      }, 1500);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setRejecting(true);
    const { error } = await client.organization.rejectInvitation({
      invitationId: id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.info("Invitation rejected.");
      router.replace("/switch-org");
    }
    setRejecting(false);
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Button disabled className="w-full bg-green-600 hover:bg-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Successfully Joined!
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Redirecting you to your organizations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        disabled={loading || rejecting}
        className="w-full"
        onClick={handleSubmit}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Joining Organization...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Join {organizationName}
          </>
        )}
      </Button>

      <Button
        disabled={loading || rejecting}
        variant="outline"
        className="w-full"
        onClick={handleReject}
        size="lg"
      >
        {rejecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rejecting...
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Reject Invitation
          </>
        )}
      </Button>

      {(loading || rejecting) && (
        <p className="text-sm text-center text-muted-foreground">
          This may take a few moments...
        </p>
      )}
    </div>
  );
};

export default Join;
