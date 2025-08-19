import { CollaborativeEditor } from "@/components/collaborative-editor";
import { getSession } from "@/actions/account/user";
import { redirect } from "next/navigation";

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await getSession();
  const documentId = (await params).id;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <CollaborativeEditor documentId={documentId} roomName={documentId} />
      </div>
    </div>
  );
}
