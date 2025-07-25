import { getSession } from "@/actions/account/user";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter: FileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await getSession();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  fileUpload: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "32MB" },
    audio: { maxFileSize: "8MB" },
    pdf: { maxFileSize: "8MB" },
    text: { maxFileSize: "1MB" },
    blob: { maxFileSize: "32MB" },
  })
    .middleware(async ({ req }) => {
      const user = await getSession();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
