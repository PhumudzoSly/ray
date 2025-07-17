import React from "react";
import { Card, CardFooter, CardHeader } from "@workspace/ui/components/card";
import AuthHeader from "./auth-header";
import BackButton from "./back-button";

const ErrorCard = () => {
  return (
    <Card className="w-full max-w-[400px] bg-destructive/20 shadow-md">
      <CardHeader className="border-none">
        <AuthHeader label="Oops, something went wrong" />
      </CardHeader>

      <CardFooter className="border-none">
        <BackButton href="/auth/sign-in" label="Back to login" />
      </CardFooter>
    </Card>
  );
};

export default ErrorCard;
