import React, { FC, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import AuthHeader from "./auth-header";
import SocialAuth from "./social";
import BackButton from "./back-button";

interface CardWrapperProps {
  children: ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

const CardWrapper: FC<CardWrapperProps> = ({
  backButtonHref,
  backButtonLabel,
  children,
  headerLabel,
  showSocial,
}) => {
  return (
    <Card className="max-w-[400px] w-full">
      <CardHeader className="border-none">
        <AuthHeader label={headerLabel} />
      </CardHeader>

      <CardContent className="pt-0">{children}</CardContent>
      {/* TODO: Add social auth */}
      {/* {showSocial && (
        <CardFooter>
          <SocialAuth />
        </CardFooter>
      )} */}
      <CardFooter className="border-none border-t-0 pt-0">
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
