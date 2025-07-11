import { Doc } from "@workspace/backend";

export type CustomIssue = Doc<"issues"> & {
  user: Doc<"user"> | null;
  project: Doc<"projects"> | null;
};
