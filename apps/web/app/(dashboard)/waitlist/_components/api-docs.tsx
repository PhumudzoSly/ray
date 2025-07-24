"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Copy, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const APIDocs = ({
  mode,
  waitlistId,
}: {
  mode: "create" | "edit";
  waitlistId: string;
}) => {
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
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
  "waitlistId": "${mode === "edit" && waitlistId ? waitlistId : "your-waitlist-id"}",
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
    waitlistId: '${mode === "edit" && waitlistId ? waitlistId : "your-waitlist-id"}',
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
    waitlistId: '${mode === "edit" && waitlistId ? waitlistId : "your-waitlist-id"}',
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
};

export default APIDocs;
