"use client";

import { useEffect, useState } from "react";
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
  Check,
} from "lucide-react";
import {
  createApiKey,
  listApiKeys,
  deleteApiKey,
  deactivateApiKey,
} from "@/actions/account/user";
import { ApiPermissionType } from "@workspace/backend";
import { format } from "date-fns";
import { toast } from "sonner";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  createdBy: string;
  createdAt: number;
  lastUsed?: number;
  isActive: boolean;
  expiresAt?: number;
}

const AVAILABLE_PERMISSIONS: {
  id: ApiPermissionType;
  label: string;
  description: string;
}[] = [
  { id: "READ", label: "Read", description: "View data and resources" },
  { id: "WRITE", label: "Write", description: "Create and update resources" },
  { id: "DELETE", label: "Delete", description: "Delete resources" },
  { id: "ADMIN", label: "Admin", description: "Full administrative access" },
];

function getPermissionBadgeVariant(permission: string) {
  switch (permission) {
    case "ADMIN":
      return "destructive" as const;
    case "WRITE":
      return "default" as const;
    case "DELETE":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

interface ApiKeysClientProps {
  initialKeys: ApiKey[];
  initialError?: string;
}

export default function ApiKeysClient({ initialKeys, initialError }: ApiKeysClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys ?? []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<ApiPermissionType[]>(["READ"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const confirm = useConfirm()

  // Track per-row busy state
  const [busyById, setBusyById] = useState<Record<string, "deactivating" | "deleting" | undefined>>({});
  const setBusy = (id: string, state?: "deactivating" | "deleting") =>
    setBusyById((b) => ({ ...b, [id]: state }));

  useEffect(() => {
    if (initialError) toast.error(initialError);
  }, [initialError]);



  const resetCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreatedKey(null);
    setShowCreatedKey(false);
    setNewKeyName("");
    setSelectedPermissions(["READ"]);
    setCopied(false);
  };


  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    setCreating(true);
    try {
      const promise = createApiKey({ name: newKeyName, permissions: selectedPermissions });
      // Show toast tied to the promise, but don't use its return value as the result
      toast.promise(promise, {
        loading: "Creating API key...",
        success: "API key created",
        error: (e) => e?.message || "Failed to create API key",
      });
      const result = await promise;
      if (result.success) {
        setCreatedKey(result?.apiKey || "");
        setShowCreatedKey(false);
        setNewKeyName("");
        setSelectedPermissions(["READ"]);
        // Keep dialog open to show the created key and refresh the list
        try {
          const list = await listApiKeys();
          if (list.success) {
            setApiKeys(list.apiKeys || []);
          }
        } catch {}
      }
    } catch {}
    finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    const ok = await confirm({
      title: "Delete API key",
      description: "Are you sure you want to delete this API key? This cannot be undone.",
    });
    if (!ok) return;
    
    const snapshot = apiKeys;
    setBusy(keyId, "deleting");
    setApiKeys((ks) => ks.filter((k) => k.id !== keyId));
    try {
      toast.promise(deleteApiKey(keyId), {
        loading: "Deleting API key...",
        success: "API key deleted",
        error: (e) => e?.message || "Failed to delete API key",
      });
    } catch (e) {
      // revert on failure
      setApiKeys(snapshot);
    } finally {
      setBusy(keyId, undefined);
    }
  };

  const handleDeactivateKey = async (keyId: string) => {
    const snapshot = apiKeys;
    setBusy(keyId, "deactivating");
    setApiKeys((ks) => ks.map((k) => (k.id === keyId ? { ...k, isActive: false } : k)));
    try {
      await toast.promise(deactivateApiKey(keyId), {
        loading: "Deactivating key...",
        success: "API key deactivated",
        error: (e) => e?.message || "Failed to deactivate API key",
      });
    } catch (e) {
      setApiKeys(snapshot);
    } finally {
      setBusy(keyId, undefined);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      toast.error("Failed to copy to clipboard");
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for your organization</p>
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
                Create a new API key for your organization. Make sure to copy it as it won't be shown again.
              </DialogDescription>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your API key has been created. Copy it now as it won't be shown again.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={showCreatedKey ? createdKey : "rk_" + "•".repeat(60)}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowCreatedKey(!showCreatedKey)}>
                      {showCreatedKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(createdKey)}
                      title={copied ? "Copied" : "Copy"}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
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
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([...selectedPermissions, permission.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter((p) => p !== permission.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={permission.id} className="text-sm font-medium">
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
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
            API keys allow external applications to access your organization's data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API keys</h3>
              <p className="text-muted-foreground mb-4">Create your first API key to get started</p>
             
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
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{key.keyPreview}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((permission) => (
                          <Badge key={permission} variant={getPermissionBadgeVariant(permission)} className="text-xs">
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
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.isActive ? "default" : "secondary"} className="text-xs">
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
                              onClick={() => handleDeactivateKey(key.id)}
                              disabled={busyById[key.id] === "deactivating"}
                              aria-busy={busyById[key.id] === "deactivating"}
                            >
                              {busyById[key.id] === "deactivating" ? "Deactivating..." : "Deactivate"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-destructive"
                            disabled={busyById[key.id] === "deleting"}
                            aria-busy={busyById[key.id] === "deleting"}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {busyById[key.id] === "deleting" ? "Deleting..." : "Delete"}
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
    </div>
  );
}
