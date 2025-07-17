import { AlertTriangle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import moment from "moment";
import { getInitials } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/utils/config";

export default function AccountBanned({
  reason,
  expires,
  email,
  name,
}: {
  reason: string;
  expires: Date;
  name: string;
  email: string;
}) {
  const date = new Date(expires);
  return (
    <div className="mx-auto max-w-md  w-full my-10">
      <div className="w-full flex flex-col gap-y-4 items-center justify-center mb-10">
        <h1 className={cn("text-2xl font-semibold")}>🔒 {APP_NAME}</h1>
        <p className="text-muted-foreground">Sorry, No Access</p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              alt="User's avatar"
              src="/placeholder.svg?height=64&width=64"
            />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-semibold">Account Banned</span>
              <span className="text-xs">
                This account has been suspended from the platform.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Ban over in: {moment(date).fromNow()}</span>
          </div>
          <p className="text-sm">Reason: {reason}</p>
        </CardContent>
      </Card>
    </div>
  );
}
