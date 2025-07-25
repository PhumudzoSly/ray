import type { FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
