import { CollaborativeEditor } from "@/components/collaborative-editor";
import { getSession } from "@/actions/account/user";
import { getEntityDocumentContent } from "@/actions/documents/document";
import { Separator } from "@workspace/ui/components/separator";

// This comment is added to trigger a re-compilation and ensure type resolution.
interface DocPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const session = await getSession();
  const projectId = (await params).id;

  // Load existing document content if it exists
  const documentResult = await getEntityDocumentContent({
    entityType: "project",
    entityId: projectId,
  });

  const initialContent = documentResult.success
    ? documentResult.document.content
    : undefined;

  return (
    <div className=" mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Project Documentation</h1>
        <p>Collaborate with your team on the requirements of this project</p>
      </div>
      <Separator />
      <CollaborativeEditor
        user={{
          id: session.userId,
          name: session.name,
        }}
        entityType="project"
        entityId={projectId}
        roomName={`project-${projectId}`}
        initialContent={initialContent}
      />
    </div>
  );
}
