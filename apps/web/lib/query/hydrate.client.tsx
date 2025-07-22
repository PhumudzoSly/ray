"use client";

import React from "react";
import {
  HydrationBoundary,
  DehydratedState,
  dehydrate,
} from "@tanstack/react-query";
import getQueryClient from "./getQueryClient";

const Hydrate = ({
  children,
  state,
}: {
  children: React.ReactNode;
  state?: any;
}) => {
  const client = getQueryClient();

  return (
    <HydrationBoundary state={state || dehydrate(client)}>
      {children}
    </HydrationBoundary>
  );
};

export default Hydrate;
