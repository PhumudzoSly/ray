"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@workspace/ui/components/alert";
import {
  revokeSession,
  sendVerificationEmail,
  signOut,
  useSession,
} from "@/lib/authClient";
import { Laptop, Loader2, LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FaMobile } from "react-icons/fa";
import { UAParser } from "ua-parser-js";
import ChangePassword from "./change-password";
import EditUserDialog from "./update-user";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Session } from "@/lib/auth-types";
// import DeleteAccount from "./delete-account";

export default function UserCard(props: {
  session: Session | null;
  activeSessions: Session["session"][];
}) {
  //

  const router = useRouter();
  const { data } = useSession.get();
  const session = data || props.session;
  const [isTerminating, setIsTerminating] = useState<string>();
  const [isSignOut, setIsSignOut] = useState<boolean>(false);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState<boolean>(false);

  return (
    <div className="mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={session?.user.image || "#"}
              alt="Avatar"
              className="object-cover"
            />
            <AvatarFallback className="text-md">
              {session?.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {session?.user.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <EditUserDialog />
          <Button
            variant="destructive"
            className="gap-2"
            onClick={async () => {
              setIsSignOut(true);
              await signOut({
                fetchOptions: {
                  onSuccess() {
                    router.push("/");
                  },
                },
              });
              setIsSignOut(false);
            }}
            disabled={isSignOut}
          >
            {isSignOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign out
          </Button>
        </div>
      </div>

      {!session?.user.emailVerified && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Verify Your Email
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Please verify your email address to access all features. Haven't
            received the email?
            <Button
              size="sm"
              variant="link"
              className="text-amber-900 dark:text-amber-200 h-auto p-0 ml-2"
              onClick={async () => {
                await sendVerificationEmail(
                  { email: session?.user.email || "" },
                  {
                    onRequest() {
                      setEmailVerificationPending(true);
                    },
                    onError(context) {
                      toast.error(context.error.message);
                      setEmailVerificationPending(false);
                    },
                    onSuccess() {
                      toast.success("Verification email sent");
                      setEmailVerificationPending(false);
                    },
                  }
                );
              }}
            >
              {emailVerificationPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Resend verification email"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          {/* <TabsTrigger value="account">Delete Account</TabsTrigger> */}
        </TabsList>

        <TabsContent value="sessions">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                  If you notice suspicious activities in your account, you can
                  change the password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePassword />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>
                  Manage sessions from every logged in device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {props.activeSessions
                    .filter((session) => session.userAgent)
                    .map((session) => {
                      const device = new UAParser(
                        session.userAgent || ""
                      ).getDevice().type;
                      const os = new UAParser(session.userAgent || "").getOS()
                        .name;
                      const browser = new UAParser(
                        session.userAgent || ""
                      ).getBrowser().name;

                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-4">
                            {device === "mobile" ? (
                              <FaMobile className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Laptop className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">
                                {os} • {browser}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {session.id === props.session?.session.id
                                  ? "Current session"
                                  : "Active"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={async () => {
                              setIsTerminating(session.id);
                              const res = await revokeSession({
                                token: session.token,
                              });

                              if (res.error) {
                                toast.error(res.error.message);
                              } else {
                                toast.success("Session terminated");
                              }
                              router.refresh();
                              setIsTerminating(undefined);
                            }}
                          >
                            {isTerminating === session.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : session.id === props.session?.session.id ? (
                              "Sign out"
                            ) : (
                              "Terminate"
                            )}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* <TabsContent value="account">
          <DeleteAccount />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
