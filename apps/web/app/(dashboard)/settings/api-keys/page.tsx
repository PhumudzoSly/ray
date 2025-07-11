"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Key,
  Trash2,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  createApiKey,
  listApiKeys,
  deleteApiKey,
  deactivateApiKey,
} from "@/actions/account/user";
import { Id } from "@workspace/backend";
import { format } from "date-fns";
import { toast } from "sonner";

interface ApiKey {
  _id: Id<"apiKeys">;
  name: string;
  keyPreview: string;
  permissions: string[];
  createdBy: string;
  createdAt: number;
  lastUsed?: number;
  isActive: boolean;
  expiresAt?: number;
}

const AVAILABLE_PERMISSIONS = [
  { id: "read", label: "Read", description: "View data and resources" },
  { id: "write", label: "Write", description: "Create and update resources" },
  { id: "delete", label: "Delete", description: "Delete resources" },
  { id: "admin", label: "Admin", description: "Full administrative access" },
];

export default function ApiKeysPage() {
  const session = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "read",
  ]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const result = await listApiKeys();
      if (result.success) {
        setApiKeys(result.apiKeys);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setCreating(true);
    try {
      const result = await createApiKey({
        name: newKeyName,
        permissions: selectedPermissions,
      });

      if (result.success) {
        setCreatedKey(result.apiKey);
        setNewKeyName("");
        setSelectedPermissions(["read"]);
        await loadApiKeys();
        toast.success("API key created successfully");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: Id<"apiKeys">) => {
    try {
      const result = await deleteApiKey(keyId);
      if (result.success) {
        await loadApiKeys();
        toast.success("API key deleted successfully");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const handleDeactivateKey = async (keyId: Id<"apiKeys">) => {
    try {
      const result = await deactivateApiKey(keyId);
      if (result.success) {
        await loadApiKeys();
        toast.success("API key deactivated successfully");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to deactivate API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getPermissionBadgeVariant = (permission: string) => {
    switch (permission) {
      case "admin":
        return "destructive";
      case "write":
        return "default";
      case "delete":
        return "secondary";
      default:
        return "outline";
    }
  };

  const resetCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreatedKey(null);
    setShowCreatedKey(false);
    setNewKeyName("");
    setSelectedPermissions(["read"]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage API keys for your organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for your organization. Make sure to copy it
                as it won't be shown again.
              </DialogDescription>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your API key has been created. Copy it now as it won't be
                    shown again.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={
                        showCreatedKey ? createdKey : "rk_" + "•".repeat(60)
                      }
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCreatedKey(!showCreatedKey)}
                    >
                      {showCreatedKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(createdKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button onClick={resetCreateDialog}>Done</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([
                                ...selectedPermissions,
                                permission.id,
                              ]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter(
                                  (p) => p !== permission.id
                                )
                              );
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-medium"
                          >
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetCreateDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={creating}>
                    {creating ? "Creating..." : "Create Key"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            API keys allow external applications to access your organization's
            data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API keys</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key._id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {key.keyPreview}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant={getPermissionBadgeVariant(permission)}
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.lastUsed ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(key.lastUsed), "MMM d, yyyy")}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Never
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={key.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {key.expiresAt && key.expiresAt < Date.now() && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {key.isActive && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivateKey(key._id)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteKey(key._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use your API keys to access your organization's data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <code className="block bg-muted p-3 rounded text-sm">
              Authorization: Bearer your_api_key_here
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Base URL</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              https://api.rayai.com/v1
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <code className="block bg-muted p-3 rounded text-sm whitespace-pre">
              {`curl -X GET "https://api.rayai.com/v1/projects" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
