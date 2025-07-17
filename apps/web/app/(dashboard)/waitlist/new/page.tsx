"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { ProjectSelector } from "@/components/ui/selectors/project-selector";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { Badge } from "@workspace/ui/components/badge";
import { Code, Copy, ExternalLink, Key, Settings, Users } from "lucide-react";
import Header from "@/components/shared/header";
import * as waitlistActions from "@/actions/waitlist";

type FormState = {
  name: string;
  slug: string;
  description: string;
  projectId: string | null;
  isPublic: boolean;
  allowNameCapture: boolean;
  showPosition: boolean;
  showSocialProof: boolean;
  customMessage: string;
};

export default function NewWaitlistPage() {
  const router = useRouter();
  const { token } = useSession();
  const createWaitlistMutation = useMutation({
    mutationFn: async (data: any) => waitlistActions.createWaitlist(data),
    onSuccess: (result) => {
      if (result && result.success && result.data && result.data.id) {
        toast.success("Waitlist created successfully!");
        router.push(`/waitlist/${result.data.id}`);
      }
    },
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    projectId: "",
    isPublic: true,
    allowNameCapture: true,
    showPosition: true,
    showSocialProof: true,
    customMessage: "",
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    setForm({ ...form, name, slug });
  };

  // Validate form
  const validateForm = (form: FormState) => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!form.projectId) {
      toast.error("Project is required");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm(form)) {
      return;
    }
    try {
      await createWaitlistMutation.mutateAsync({
        ...form,
        projectId: form.projectId as any,
        customMessage: form.customMessage || undefined,
      });
    } catch (error) {
      console.error("Error creating waitlist:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create waitlist"
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const apiDocsContent = (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="text-sm font-medium mb-1">API Integration</h3>
        <p className="text-xs text-muted-foreground">
          Integrate your waitlist with your application
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Authentication</span>
            <Badge variant="outline" className="text-xs">
              Bearer Token
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings/api-keys")}
            className="w-full text-xs"
          >
            <Key className="w-3 h-3 mr-1" />
            Manage API Keys
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Join Waitlist</span>
            <Badge variant="secondary" className="text-xs">
              POST
            </Badge>
          </div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            POST /api/waitlist/join
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">Headers</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono space-y-1">
            <div>Authorization: Bearer YOUR_API_KEY</div>
            <div>Content-Type: application/json</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">Request Body</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            <pre className="text-xs">
              {`{
  "waitlistId": "your-waitlist-id",
  "email": "user@example.com",
  "name": "John Doe"
}`}
            </pre>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">JavaScript Example</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            <pre className="text-xs">
              {`fetch('/api/waitlist/join', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    waitlistId: 'your-waitlist-id',
    email: 'user@example.com'
  })
})`}
            </pre>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyToClipboard(`fetch('/api/waitlist/join', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    waitlistId: 'your-waitlist-id',
    email: 'user@example.com'
  })
})`)
            }
            className="w-full text-xs mt-2"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Create waitlist</h1>
            <p className="text-sm text-muted-foreground">
              You can collect waitlist users via API or hosted URLs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Beta Access Waitlist"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Slug</label>
              <Input
                placeholder="beta-access-waitlist"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Get early access to our new features and help shape the future of our product."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project</label>
            <ProjectSelector
              currentProject={form.projectId}
              onChange={(projectId) => setForm({ ...form, projectId })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message</label>
            <Textarea
              placeholder="Thanks for joining! We'll notify you when it's your turn."
              value={form.customMessage}
              onChange={(e) =>
                setForm({ ...form, customMessage: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Settings</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Public</div>
                <div className="text-xs text-muted-foreground">
                  Allow anyone to join the waitlist
                </div>
              </div>
              <Switch
                checked={form.isPublic}
                onCheckedChange={(isPublic) => setForm({ ...form, isPublic })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Capture Names</div>
                <div className="text-xs text-muted-foreground">
                  Ask for user names in addition to email
                </div>
              </div>
              <Switch
                checked={form.allowNameCapture}
                onCheckedChange={(allowNameCapture) =>
                  setForm({ ...form, allowNameCapture })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Show Position</div>
                <div className="text-xs text-muted-foreground">
                  Display user's position in the waitlist
                </div>
              </div>
              <Switch
                checked={form.showPosition}
                onCheckedChange={(showPosition) =>
                  setForm({ ...form, showPosition })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Social Proof</div>
                <div className="text-xs text-muted-foreground">
                  Show total signups and recent activity
                </div>
              </div>
              <Switch
                checked={form.showSocialProof}
                onCheckedChange={(showSocialProof) =>
                  setForm({ ...form, showSocialProof })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => router.push("/waitlist")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Waitlist</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header
        crumb={[
          { title: "Waitlists", url: "/waitlist" },
          { title: "New Waitlist" },
        ]}
      >
        <></>
      </Header>
      <ExpandedLayoutContainer sidebar={apiDocsContent}>
        {mainContent}
      </ExpandedLayoutContainer>
    </>
  );
}
