"use client";

import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "./getQueryClient";

const Hydrate = ({ children }: { children: React.ReactNode }) => {
  const client = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>
  );
};

export default Hydrate;
