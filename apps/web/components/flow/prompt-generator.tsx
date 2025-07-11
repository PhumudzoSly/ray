"use client";

import { useState, useEffect } from "react";
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
  Wand2,
  Copy,
  Check,
  Save,
  History,
  Sparkles,
  Code,
  TestTube,
  FileText,
  Bug,
  Zap,
  Rocket,
} from "lucide-react";
import { Project } from "@/lib/types";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Id } from "@workspace/backend";
import { useSession } from "@/context/session-context";

interface PromptGeneratorProps {
  project: Project;
  nodeId?: string;
  onClose: () => void;
}

export function PromptGenerator({
  project,
  nodeId,
  onClose,
}: PromptGeneratorProps) {
  const { token } = useSession();
  const [selectedTemplate, setSelectedTemplate] =
    useState<Id<"promptTemplates"> | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>("cursor");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [promptTitle, setPromptTitle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Queries
  const templates = useQuery(api.promptTemplates.getTemplates, {
    token,
  });
  const existingPRD = useQuery(
    api.prds.getByNode,
    nodeId
      ? {
          projectId: project._id as Id<"projects">,
          nodeId,
          token,
        }
      : "skip"
  );
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

  const generatedPrompts = useQuery(api.generatedPrompts.getByProject, {
    projectId: project._id as Id<"projects">,
    token,
  });

  // Mutations
  const createGeneratedPrompt = useMutation(api.generatedPrompts.create);
  const seedTemplates = useMutation(api.promptTemplates.seedDefaultTemplates);

  // Seed default templates on component mount
  useEffect(() => {
    seedTemplates({ token });
  }, [seedTemplates]);

  const aiTools = [
    {
      id: "cursor",
      name: "Cursor",
      icon: "🎯",
      description: "AI-powered code editor",
    },
    {
      id: "bolt",
      name: "Bolt.new",
      icon: "⚡",
      description: "Full-stack web development",
    },
    {
      id: "v0",
      name: "v0.dev",
      icon: "🎨",
      description: "UI component generation",
    },
    {
      id: "claude",
      name: "Claude",
      icon: "🤖",
      description: "Anthropic AI assistant",
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      icon: "💬",
      description: "OpenAI assistant",
    },
    {
      id: "copilot",
      name: "GitHub Copilot",
      icon: "🐙",
      description: "AI pair programmer",
    },
    {
      id: "universal",
      name: "Universal",
      icon: "🌐",
      description: "Works with any AI tool",
    },
  ];

  const categories = [
    {
      id: "implementation",
      name: "Implementation",
      icon: Code,
      color: "bg-blue-500",
    },
    { id: "testing", name: "Testing", icon: TestTube, color: "bg-green-500" },
    {
      id: "documentation",
      name: "Documentation",
      icon: FileText,
      color: "bg-purple-500",
    },
    { id: "debugging", name: "Debugging", icon: Bug, color: "bg-red-500" },
    {
      id: "optimization",
      name: "Optimization",
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      id: "deployment",
      name: "Deployment",
      icon: Rocket,
      color: "bg-orange-500",
    },
  ];

  const filteredTemplates =
    templates?.filter(
      (template) =>
        selectedTool === "universal" ||
        template.targetTool === selectedTool ||
        template.targetTool === "universal"
    ) || [];

  const selectedTemplateData = templates?.find(
    (t) => t._id === selectedTemplate
  );

  // Auto-populate variables when template changes
  useEffect(() => {
    if (selectedTemplateData) {
      const newVariables: Record<string, string> = {};

      selectedTemplateData.variables.forEach((variable) => {
        switch (variable) {
          case "projectName":
            newVariables[variable] = project.name;
            break;

          case "platform":
            newVariables[variable] = project.platform;
            break;
          case "techStack":
            newVariables[variable] =
              `${project.techStack.auth}, ${project.techStack.orm}, ${project.techStack.database}, ${project.techStack.ai}`;
            break;
          case "featureName":
            newVariables[variable] = nodeId ? "Feature Name" : project.name;
            break;
          case "prdContent":
            newVariables[variable] =
              existingPRD?.content ||
              "No PRD available - please generate one first";
            break;
          case "libraryList":
            const libraries = nodeId ? nodeLibraries : projectLibraries;
            newVariables[variable] =
              libraries
                ?.map(
                  (lib) =>
                    `- ${lib.name}: ${lib.description || "No description"}`
                )
                .join("\n") || "No libraries configured";
            break;
          case "fileStructure":
            newVariables[variable] = `src/
├── components/
│   └── ${nodeId || "feature"}/
├── hooks/
├── utils/
├── types/
└── tests/`;
            break;
          case "integrationPoints":
            newVariables[variable] =
              "Integration points will be determined based on connected nodes";
            break;
          case "acceptanceCriteria":
            newVariables[variable] =
              "- [ ] Feature works as expected\n- [ ] Tests pass\n- [ ] Accessible design\n- [ ] Responsive layout";
            break;
          default:
            newVariables[variable] = "";
        }
      });

      setVariables(newVariables);
    }
  }, [
    selectedTemplateData,
    project,
    nodeId,
    existingPRD,
    projectLibraries,
    nodeLibraries,
  ]);

  const handleGeneratePrompt = () => {
    if (!selectedTemplateData) {
      toast.error("Please select a template");
      return;
    }

    setIsGenerating(true);

    // Replace variables in template
    let prompt = selectedTemplateData.template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      prompt = prompt.replace(regex, value);
    });

    setGeneratedPrompt(prompt);
    setPromptTitle(
      `${selectedTemplateData.name} - ${project.name}${nodeId ? ` (${nodeId})` : ""}`
    );
    setIsGenerating(false);
    toast.success("Prompt generated successfully!");
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const handleSavePrompt = async () => {
    if (!generatedPrompt || !selectedTemplate) {
      toast.error("No prompt to save");
      return;
    }

    try {
      await createGeneratedPrompt({
        projectId: project._id as Id<"projects">,
        nodeId,
        templateId: selectedTemplate,
        title: promptTitle,
        content: generatedPrompt,
        targetTool: selectedTool,
        variables,
        token,
      });
      toast.success("Prompt saved successfully!");
    } catch (error) {
      toast.error("Failed to save prompt");
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.icon : Code;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.color : "bg-gray-500";
  };

  return (
    <div className="w-96 border-l bg-background h-full overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Prompt Generator
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            {/* AI Tool Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Target AI Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTool} onValueChange={setSelectedTool}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiTools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        <div className="flex items-center gap-2">
                          <span>{tool.icon}</span>
                          <div>
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {tool.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prompt Template</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {filteredTemplates.map((template) => {
                      const IconComponent = getCategoryIcon(template.category);
                      const isSelected = selectedTemplate === template._id;

                      return (
                        <div
                          key={template._id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted"
                          }`}
                          onClick={() => setSelectedTemplate(template._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-md ${getCategoryColor(template.category)}`}
                            >
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">
                                  {template.name}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {template.targetTool}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Variable Configuration */}
            {selectedTemplateData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {selectedTemplateData.variables.map((variable) => (
                        <div key={variable} className="space-y-1">
                          <Label htmlFor={variable} className="text-xs">
                            {variable
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Label>
                          {variable === "prdContent" ||
                          variable === "libraryList" ||
                          variable === "fileStructure" ? (
                            <Textarea
                              id={variable}
                              value={variables[variable] || ""}
                              onChange={(e) =>
                                setVariables({
                                  ...variables,
                                  [variable]: e.target.value,
                                })
                              }
                              rows={3}
                              className="text-xs"
                            />
                          ) : (
                            <Input
                              id={variable}
                              value={variables[variable] || ""}
                              onChange={(e) =>
                                setVariables({
                                  ...variables,
                                  [variable]: e.target.value,
                                })
                              }
                              className="text-xs"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePrompt}
              disabled={!selectedTemplate || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Prompt
                </>
              )}
            </Button>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Generated Prompt</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyPrompt}
                        disabled={copiedPrompt}
                      >
                        {copiedPrompt ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSavePrompt}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedPrompt}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {generatedPrompts && generatedPrompts.length > 0 ? (
                  generatedPrompts
                    .filter((prompt) => !nodeId || prompt.nodeId === nodeId)
                    .map((prompt) => (
                      <Card
                        key={prompt._id}
                        className="border-l-4 border-l-purple-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {prompt.title}
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(prompt.content);
                                  toast.success("Prompt copied!");
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {prompt.targetTool}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded max-h-20 overflow-hidden">
                            {prompt.content.substring(0, 200)}...
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Saved Prompts
                    </h3>
                    <p className="text-muted-foreground">
                      Generated prompts will appear here after you save them
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
