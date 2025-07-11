"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Package,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Star,
  Settings,
  BookOpen,
  Terminal,
} from "lucide-react";
import { Project } from "@/lib/types";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";

interface LibraryManagerProps {
  project: Project;
  nodeId?: string;
  onClose: () => void;
}

export function LibraryManager({
  project,
  nodeId,
  onClose,
}: LibraryManagerProps) {
  const { token } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("ui");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [newLibrary, setNewLibrary] = useState({
    name: "",
    version: "",
    category: "other" as const,
    installCommand: "",
    description: "",
    documentationUrl: "",
    configRequired: false,
    configNotes: "",
  });

  // Queries
  const projectLibraries = useQuery(
    api.libraryDependencies.getLibrariesByProject,
    {
      projectId: project._id as Id<"projects">,
      token,
    }
  );

  const nodeLibraries = useQuery(
    api.libraryDependencies.getLibrariesByNode,
    nodeId
      ? {
          projectId: project._id as Id<"projects">,
          nodeId,
          token,
        }
      : "skip"
  );

  const recommendations = useQuery(api.libraryDependencies.getRecommendations, {
    category: selectedCategory,
    token,
  });

  // Mutations
  const addLibrary = useMutation(api.libraryDependencies.addLibrary);
  const addRecommendedLibraries = useMutation(
    api.libraryDependencies.addRecommendedLibraries
  );
  const removeLibrary = useMutation(api.libraryDependencies.removeLibrary);
  const updateLibrary = useMutation(api.libraryDependencies.updateLibrary);

  const categories = [
    { id: "ui", label: "UI Components", icon: "🎨" },
    { id: "state", label: "State Management", icon: "🔄" },
    { id: "auth", label: "Authentication", icon: "🔐" },
    { id: "database", label: "Database", icon: "🗄️" },
    { id: "api", label: "API & HTTP", icon: "🌐" },
    { id: "testing", label: "Testing", icon: "🧪" },
    { id: "validation", label: "Validation", icon: "✅" },
    { id: "ai", label: "AI & ML", icon: "🤖" },
    { id: "other", label: "Other", icon: "📦" },
  ];

  const displayLibraries = nodeId ? nodeLibraries : projectLibraries;
  const filteredLibraries =
    displayLibraries?.filter(
      (lib) => selectedCategory === "all" || lib.category === selectedCategory
    ) || [];

  const handleAddCustomLibrary = async () => {
    if (!newLibrary.name || !newLibrary.installCommand) {
      toast.error("Name and install command are required");
      return;
    }

    try {
      await addLibrary({
        projectId: project._id as Id<"projects">,
        nodeId,
        ...newLibrary,
        token,
      });

      setNewLibrary({
        name: "",
        version: "",
        category: "other",
        installCommand: "",
        description: "",
        documentationUrl: "",
        configRequired: false,
        configNotes: "",
      });
      setShowAddDialog(false);
      toast.success("Library added successfully!");
    } catch (error) {
      toast.error("Failed to add library");
    }
  };

  const handleAddRecommended = async (libraryNames: string[]) => {
    try {
      await addRecommendedLibraries({
        projectId: project._id as Id<"projects">,
        nodeId,
        category: selectedCategory as any,
        libraries: libraryNames,
        token,
      });
      toast.success(`Added ${libraryNames.length} recommended libraries!`);
    } catch (error) {
      toast.error("Failed to add recommended libraries");
    }
  };

  const handleCopyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      toast.success("Install command copied!");
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (error) {
      toast.error("Failed to copy command");
    }
  };

  const handleRemoveLibrary = async (libraryId: Id<"libraryDependencies">) => {
    try {
      await removeLibrary({ id: libraryId, token });
      toast.success("Library removed successfully!");
    } catch (error) {
      toast.error("Failed to remove library");
    }
  };

  return (
    <div className="w-96 border-l bg-background h-full overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Library Manager
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={nodeId ? "default" : "secondary"}>
              {nodeId ? "Node-Specific" : "Project-Wide"}
            </Badge>
          </div>
          {nodeId && (
            <p className="text-xs text-muted-foreground">
              These libraries will be included in prompts for this specific node
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Libraries</TabsTrigger>
          <TabsTrigger value="recommendations">Add Libraries</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Current Libraries */}
          <ScrollArea>
            <div className="space-y-3">
              {filteredLibraries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Libraries</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedCategory === "all"
                      ? "No libraries added yet"
                      : `No ${categories.find((c) => c.id === selectedCategory)?.label} libraries`}
                  </p>
                </div>
              ) : (
                filteredLibraries.map((library) => (
                  <Card
                    key={library._id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{library.name}</h4>
                          {library.version && (
                            <Badge variant="outline" className="text-xs">
                              v{library.version}
                            </Badge>
                          )}
                          {library.isRecommended && (
                            <Star className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveLibrary(library._id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {library.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {library.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3 h-3 text-muted-foreground" />
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                            {library.installCommand}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleCopyCommand(library.installCommand)
                            }
                          >
                            {copiedCommand === library.installCommand ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {
                              categories.find((c) => c.id === library.category)
                                ?.label
                            }
                          </Badge>
                          {library.configRequired && (
                            <Badge variant="outline" className="text-xs">
                              <Settings className="w-2 h-2 mr-1" />
                              Config Required
                            </Badge>
                          )}
                          {library.documentationUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a
                                href={library.documentationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <BookOpen className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>

                        {library.configNotes && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>Config Notes:</strong> {library.configNotes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Category Selection */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((c) => c.id !== "all")
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Add Custom Library */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Library
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Library</DialogTitle>
                <DialogDescription>
                  Add a custom library that's not in our recommendations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newLibrary.name}
                      onChange={(e) =>
                        setNewLibrary({ ...newLibrary, name: e.target.value })
                      }
                      placeholder="react-router-dom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={newLibrary.version}
                      onChange={(e) =>
                        setNewLibrary({
                          ...newLibrary,
                          version: e.target.value,
                        })
                      }
                      placeholder="6.8.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installCommand">Install Command *</Label>
                  <Input
                    id="installCommand"
                    value={newLibrary.installCommand}
                    onChange={(e) =>
                      setNewLibrary({
                        ...newLibrary,
                        installCommand: e.target.value,
                      })
                    }
                    placeholder="npm install react-router-dom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newLibrary.description}
                    onChange={(e) =>
                      setNewLibrary({
                        ...newLibrary,
                        description: e.target.value,
                      })
                    }
                    placeholder="Declarative routing for React"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newLibrary.category}
                    onValueChange={(value: any) =>
                      setNewLibrary({ ...newLibrary, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddCustomLibrary} className="flex-1">
                    Add Library
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Recommended Libraries */}
          <ScrollArea className="h-[350px]">
            <div className="space-y-3">
              {recommendations && recommendations.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Recommended for{" "}
                      {categories.find((c) => c.id === selectedCategory)?.label}
                    </h4>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddRecommended(recommendations.map((r) => r.name))
                      }
                    >
                      Add All
                    </Button>
                  </div>
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{rec.name}</h4>
                          <Button
                            size="sm"
                            onClick={() => handleAddRecommended([rec.name])}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>

                        {rec.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {rec.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                              {rec.installCommand}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopyCommand(rec.installCommand)
                              }
                            >
                              {copiedCommand === rec.installCommand ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            {rec.configRequired && (
                              <Badge variant="outline" className="text-xs">
                                <Settings className="w-2 h-2 mr-1" />
                                Config Required
                              </Badge>
                            )}
                            {rec.documentationUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a
                                  href={rec.documentationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            )}
                          </div>

                          {rec.configNotes && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                              <strong>Setup Notes:</strong> {rec.configNotes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Recommendations
                  </h3>
                  <p className="text-muted-foreground">
                    No recommendations available for this category
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
