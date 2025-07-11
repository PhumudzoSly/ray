"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { Badge } from "@workspace/ui/components/badge";
import { Copy, Key, Loader2 } from "lucide-react";
import { Id } from "@workspace/backend";
import Header from "@/components/shared/header";

type FormState = {
  name: string;
  description: string;
  isPublic: boolean;
  allowNameCapture: boolean;
  showPosition: boolean;
  showSocialProof: boolean;
  customMessage: string;
};

export default function EditWaitlistPage() {
  const router = useRouter();
  const params = useParams();
  const waitlistId = params.id as Id<"waitlists">;
  const { token } = useSession();

  const updateWaitlist = useMutation(api.waitlists.updateWaitlist);

  // Fetch waitlist data
  const waitlist = useQuery(api.waitlists.getWaitlistById, {
    waitlistId,
    token,
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    isPublic: true,
    allowNameCapture: true,
    showPosition: true,
    showSocialProof: true,
    customMessage: "",
  });

  // Populate form when waitlist data loads
  useEffect(() => {
    if (waitlist) {
      setForm({
        name: waitlist.name,
        description: waitlist.description,
        isPublic: waitlist.isPublic,
        allowNameCapture: waitlist.allowNameCapture,
        showPosition: waitlist.showPosition,
        showSocialProof: waitlist.showSocialProof,
        customMessage: waitlist.customMessage || "",
      });
    }
  }, [waitlist]);

  // Validate form
  const validateForm = (form: FormState) => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm(form)) {
      return;
    }

    try {
      await updateWaitlist({
        waitlistId,
        ...form,
        customMessage: form.customMessage || undefined,
        token,
      });

      toast.success("Waitlist updated successfully!");
      router.push(`/waitlist/${waitlistId}`);
    } catch (error) {
      console.error("Error updating waitlist:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update waitlist"
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
          <div className="text-xs font-medium mb-2">Request Body</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            <pre className="text-xs">
              {`{
  "waitlistId": "${waitlistId}",
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
    waitlistId: '${waitlistId}',
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
    waitlistId: '${waitlistId}',
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

  if (waitlist === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (waitlist === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Waitlist Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The waitlist you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button onClick={() => router.push("/waitlist")}>
            Back to Waitlists
          </Button>
        </div>
      </div>
    );
  }

  const mainContent = (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Beta Access Waitlist"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border-0 bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug</label>
            <Input
              value={waitlist.slug}
              disabled
              className="border-0 bg-muted/30 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              URL slug cannot be changed after creation
            </p>
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
              className="border-0 bg-muted/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project</label>
            <Input
              value={waitlist.project?.name || "Unknown Project"}
              disabled
              className="border-0 bg-muted/30 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Project cannot be changed after creation
            </p>
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
              className="border-0 bg-muted/50 resize-none"
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
          <Button
            variant="outline"
            onClick={() => router.push(`/waitlist/${waitlistId}`)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Waitlist</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header
        crumb={[
          { title: "Waitlists", url: "/waitlist" },
          { title: waitlist.name, url: `/waitlist/${waitlistId}` },
          { title: "Edit" },
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
