"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CircleAlertIcon } from "lucide-react";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";
import { deleteAccount } from "@/actions/account/user";
import { toast } from "sonner";

const DeleteAccount = () => {
  const confirm = useConfirm();
  const handleDeleteAccount = async () => {
    const isConfirmed = await confirm({
      title: "Are you sure",
      description: "Deleting your account means you lose all of your data",
    });

    if (isConfirmed) {
      toast.promise(deleteAccount(), {
        error: "Failed to delete your account, contact administrator",
        loading: "Deleting your account",
        success: "Account deleted successfully",
      });
    }
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border px-4 py-3">
            <div className="flex gap-3">
              <CircleAlertIcon
                className="mt-0.5 shrink-0 text-red-500 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <div className="grow space-y-1">
                <p className="text-sm font-medium">Are you sure?</p>
                <ul className="text-muted-foreground mt-1 list-inside list-disc text-sm">
                  <li>Your subscription will be cancelled</li>
                  <li>All of your data will be lost</li>
                  <li>This active is irrevesible</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleDeleteAccount} variant={"destructive"}>
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeleteAccount;
