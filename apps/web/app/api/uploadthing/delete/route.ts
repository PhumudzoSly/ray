import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const { keys } = await request.json();

    if (!Array.isArray(keys)) {
      return new Response("Invalid request body", { status: 400 });
    }

    await Promise.all(keys.map((key) => utapi.deleteFiles(key)));

    return new Response("Files deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting files:", error);

    return new Response("Error deleting files", { status: 500 });
  }
}
