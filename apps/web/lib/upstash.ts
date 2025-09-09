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
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://app.rayai.dev"
        : "http://many-cities-teach.loca.lt";
    const fullUrl = `${baseUrl}/api/workflows${url}`;

    await workflowClient.trigger({
      url: fullUrl,
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
