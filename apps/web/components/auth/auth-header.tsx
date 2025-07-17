import { cn } from "@/lib/utils";
import { APP_NAME } from "@/utils/config";
import React, { FC } from "react";

interface HeaderProps {
  label: string;
}

const AuthHeader: FC<HeaderProps> = ({ label }) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className={cn("text-2xl font-semibold")}>{APP_NAME}</h1>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};

export default AuthHeader;
