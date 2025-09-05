"use server";

import { Client } from "@upstash/workflow";
const workflowClient = new Client({});

export const runWorkflow = async ({
  body,
  url,
}: {
  body: any;
  url: string;
}) => {
  try {
    await workflowClient.trigger({
      url: `http://short-spoons-float.loca.lt/api/workflows${url}`,
      body,
      headers: {
        "Content-Type": "application/json",
        "Upstash-Forward-bypass-tunnel-reminder": "true",
      },
    });
  } catch (error) {
    throw new Error("Failed to run workflow");
  }
};
