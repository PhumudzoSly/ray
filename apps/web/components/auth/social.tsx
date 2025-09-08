"use client";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@workspace/ui/components/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/utils/config";
import { signIn } from "@/lib/authClient";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const SocialAuth = () => {
  //
  const params = useSearchParams();
  const redirectURL = params.get("redirectUrl") || DEFAULT_LOGIN_REDIRECT;
  //
  return (
    <div className="flex flex-col items-center w-full gap-2">
      {/* <Button
        size={"lg"}
        className="w-full"
        variant={"outline"}
        onClick={async () => {
          const { error } = await signIn.social({
            provider: "google",
            callbackURL: redirectURL,
          });
          if (error) {
            toast.error(error.message);
          }
        }}
      >
        <FcGoogle className="h-5 w-5" /> Continue with Google
      </Button> */}

      <Button
        size={"lg"}
        className="w-full"
        variant={"outline"}
        onClick={async () => {
          const { error } = await signIn.social({
            provider: "github",
            callbackURL: DEFAULT_LOGIN_REDIRECT,
          });
          if (error) {
            toast.error(error.message);
          }
        }}
      >
        <FaGithub className="h-5 w-5" /> Continue with Github
      </Button>
    </div>
  );
};

export default SocialAuth;
