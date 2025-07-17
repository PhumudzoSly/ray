import AuthHeader from "@/components/auth/auth-header";
import BackButton from "@/components/auth/back-button";
import { Card, CardFooter, CardHeader } from "@workspace/ui/components/card";
import React from "react";
import ErrorCard from "@/components/auth/error-card";
import { auth } from "@/lib/auth";

const NewVerification = async (props: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await props.searchParams;
  if (!token) return <ErrorCard />;

  const data = await auth.api.verifyEmail({ query: { token: token } });

  if (!data) {
    return <ErrorCard />;
  }

  return (
    <div className="mx-auto w-full max-w-md p-10 flex items-center justify-center h-full">
      <Card className="w-full max-w-[400px] bg-emerald-500/50 shadow-md">
        <CardHeader>
          <AuthHeader label="Email Confirmed Successfully" />
        </CardHeader>
        <CardFooter>
          <BackButton href="/auth/sign-in" label="Back to login" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewVerification;
