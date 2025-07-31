"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prepValidation, getValidations } from "@/actions/idea/validate";
import { ImportanceType, ResearchPhaseTypeType } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@workspace/ui/components/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Plus, Search, Filter, Loader2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ResearchDetails } from "./research-details";
import { ResearchDepthSelector } from "@/components/research/ResearchDepthSelector";
import type { ResearchDepth } from "@/types/research";

interface ResearchTableProps {
  ideaId: string;
}

const RESEARCH_TYPE_LABELS: Record<ResearchPhaseTypeType, string> = {
  COMPLETE: "Complete Analysis",
  BUSINESS_MODEL: "Business Model",
  COMPETITIVE_ANALYSIS: "Competitive Analysis",
  CUSTOMER_VALIDATION: "Customer Validation",
  FINANCIAL_PROJECTIONS: "Financial Projections",
  GO_TO_MARKET: "Go-to-Market",
  INVESTMENT_RECOMMENDATION: "Investment Recommendation",
  MARKET_SCAN: "Market Opportunity",
  PRODUCT_MARKET_FIT: "Product-Market Fit",
  RISK_ANALYSIS: "Risk Analysis",
  TECHNICAL_FEASIBILITY: "Technical Feasibility",
};

const CONFIDENCE_LEVEL_COLORS: Record<ImportanceType, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

const CONFIDENCE_LEVEL_LABELS: Record<ImportanceType, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

// Add interface for research data structure
type ResearchData = Awaited<ReturnType<typeof getValidations>>[number];
export function ResearchTable({ ideaId }: ResearchTableProps) {
  //

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewResearchOpen, setIsNewResearchOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ResearchPhaseTypeType | "">(
    ""
  );
  const [selectedDepth, setSelectedDepth] = useState<ResearchDepth>("STANDARD");

  const [form, setForm] = useState({
    prompt: "",
    name: "",
  });

  const [selectedResearchId, setSelectedResearchId] = useState<string | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: researches, isLoading } = useQuery({
    queryKey: ["idea-research", ideaId],
    queryFn: () => getValidations({ ideaId }),
  });

  const startValidationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedType) {
        throw new Error("Please select a validation type");
      }

      return await prepValidation({
        ideaId,
        name: form.name || RESEARCH_TYPE_LABELS[selectedType],
        type: selectedType,
        prompt: form.prompt || undefined,
        depth: selectedDepth,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea-research", ideaId] });
      setIsNewResearchOpen(false);
      setSelectedType("");
      setSelectedDepth("STANDARD");
      setForm({ prompt: "", name: "" });

      // Show success message
      console.log("Validation started successfully");
    },
    onError: (error) => {
      console.error("Failed to start validation:", error);
      // You could add a toast notification here
    },
  });

  const filteredResearches = researches?.filter((research: ResearchData) => {
    const matchesSearch = research?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && research.status === "COMPLETED") ||
      (statusFilter === "in-progress" && research.status !== "COMPLETED");

    return matchesSearch && matchesStatus;
  });

  const handleStartResearch = () => {
    if (selectedType) {
      startValidationMutation.mutate();
    }
  };

  const handleRowClick = (researchId: string) => {
    setSelectedResearchId(researchId);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedResearchId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Research</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-background border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validations</CardTitle>
              <CardDescription>
                Validations are a way to get insights about your idea.
              </CardDescription>
            </div>
            <Dialog
              open={isNewResearchOpen}
              onOpenChange={setIsNewResearchOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Validation Research
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start New Validation</DialogTitle>
                  <DialogDescription>
                    Configure your validation research with custom parameters
                    and research depth.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Validation Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="validation-type">Validation Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setSelectedType(value as ResearchPhaseTypeType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select validation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RESEARCH_TYPE_LABELS).map(
                          ([type, label]) => (
                            <SelectItem key={type} value={type}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="validation-name">Validation Name</Label>
                    <Input
                      id="validation-name"
                      placeholder="Enter a name for this validation"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Prompt Field */}
                  <div className="space-y-2">
                    <Label htmlFor="validation-prompt">
                      Custom Prompt (Optional)
                    </Label>
                    <Textarea
                      id="validation-prompt"
                      placeholder="Add any specific instructions or focus areas for this validation..."
                      value={form.prompt}
                      onChange={(e) =>
                        setForm({ ...form, prompt: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  {/* Research Depth Selector */}
                  <div className="space-y-2">
                    <Label>Research Depth</Label>
                    <ResearchDepthSelector
                      ideaId={ideaId}
                      disabled={false}
                      selectedDepth={selectedDepth}
                      onDepthChange={setSelectedDepth}
                      showButton={false}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsNewResearchOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartResearch}
                    disabled={
                      !selectedType || startValidationMutation.isPending
                    }
                  >
                    {startValidationMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Start Validation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search validation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Depth</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Phases</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResearches?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No validation found. Start your first validation to get
                        insights about your idea.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResearches?.map((research: ResearchData) => (
                      <TableRow
                        key={research.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(research.id)}
                      >
                        <TableCell className="font-medium">
                          {research.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              research.status === "COMPLETED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {research.status === "COMPLETED"
                              ? "Completed"
                              : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{research.depth}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {research.overallConfidence.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {research._count.phases}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(research.updatedAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(research.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResearchDetails
        ideaId={ideaId}
        researchId={selectedResearchId}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </>
  );
}
