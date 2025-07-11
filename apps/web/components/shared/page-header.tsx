"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PageHeader = ({ title }: { title: string }) => {
  //

  const pathname = usePathname();

  // Set the title to localstorage as pageName everytime the pathname changes
  useEffect(() => {
    localStorage.setItem("pageName", title);
  }, [title, pathname]);

  return null;
};

export default PageHeader;
