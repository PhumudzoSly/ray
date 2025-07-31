"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResearches, startValidation } from "@/actions/idea";
import { ResearchTypeType, ImportanceType } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
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

interface ResearchTableProps {
  ideaId: string;
}

const RESEARCH_TYPE_LABELS: Record<ResearchTypeType, string> = {
  COMPLETE: "Complete Analysis",
  BUSINESS_MODEL: "Business Model",
  COMPETITIVE_ANALYSIS: "Competitive Analysis",
  CUSTOMER_VALIDATION: "Customer Validation",
  FINANCIAL_PROJECTIONS: "Financial Projections",
  GO_TO_MARKET: "Go-to-Market",
  INVESTMENT_RECOMMENDATION: "Investment Recommendation",
  MARKET_OPPORTUNITY: "Market Opportunity",
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

export function ResearchTable({ ideaId }: ResearchTableProps) {
  //

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isNewResearchOpen, setIsNewResearchOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ResearchTypeType | "">("");
  const [selectedResearchId, setSelectedResearchId] = useState<string | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: researches, isLoading } = useQuery({
    queryKey: ["idea-research", ideaId],
    queryFn: () => getResearches({ id: ideaId }),
  });

  const startValidationMutation = useMutation({
    mutationFn: ({ type }: { type: ResearchTypeType }) =>
      startValidation({ ideaId, type }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["idea-research", ideaId] });
      setIsNewResearchOpen(false);
      setSelectedType("");

      // Show success message
      console.log("Deep research validation started:", result);
    },
    onError: (error) => {
      console.error("Failed to start validation:", error);
      // You could add a toast notification here
    },
  });

  const filteredResearches = researches?.filter((research) => {
    const matchesSearch = RESEARCH_TYPE_LABELS[
      research.type
    ]!.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && research.completed) ||
      (statusFilter === "in-progress" && !research.completed);

    const matchesType = typeFilter === "all" || research.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStartResearch = () => {
    if (selectedType) {
      startValidationMutation.mutate({
        type: selectedType as ResearchTypeType,
      });
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
                  New Validation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Validation</DialogTitle>
                  <DialogDescription>
                    Choose the type of validation you want to conduct for this
                    idea. This will trigger our AI-powered deep research agent
                    to analyze your idea comprehensively.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select
                    value={selectedType}
                    onValueChange={(value) =>
                      setSelectedType(value as ResearchTypeType)
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
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
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResearches?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No validation found. Start your first validation to get
                        insights about your idea.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResearches?.map((research) => (
                      <TableRow
                        key={research.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(research.id)}
                      >
                        <TableCell className="font-medium">
                          {RESEARCH_TYPE_LABELS[research.type]}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              research.completed ? "default" : "secondary"
                            }
                          >
                            {research.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              CONFIDENCE_LEVEL_COLORS[research.confidenceLevel]
                            }
                          >
                            {CONFIDENCE_LEVEL_LABELS[research.confidenceLevel]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {research.validationScore !== null ? (
                            <span className="font-medium">
                              {research.validationScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(research.lastUpdated), {
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
