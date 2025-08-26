import React, { FC } from "react";
import { buttonVariants } from "@workspace/ui/components/button";
import Link from "next/link";

interface BackButtonProps {
  label: string;
  href: string;
}

const BackButton: FC<BackButtonProps> = ({ href, label }) => {
  return (
    <Link
      href={href as any}
      className={buttonVariants({
        variant: "link",
        className: "font-normal w-full",
      })}
    >
      {label}
    </Link>
  );
};

export default BackButton;
