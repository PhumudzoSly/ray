"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import {
  evaluateQualityGates,
  checkDeploymentGate,
  QualityGateResult,
} from "@/actions/quality-gates";
import { toast } from "sonner";

interface QualityGatesProps {
  projectId: string;
}

export function QualityGates({ projectId }: QualityGatesProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: qualityGateResult,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["quality-gates", projectId],
    queryFn: () => evaluateQualityGates(projectId),
  });

  const { data: deploymentGate, isLoading: deploymentLoading } = useQuery({
    queryKey: ["deployment-gate", projectId],
    queryFn: () => checkDeploymentGate(projectId),
  });

  const evaluateMutation = useMutation({
    mutationFn: () => evaluateQualityGates(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-gates", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["deployment-gate", projectId],
      });
      toast.success("Quality gates evaluated successfully");
    },
    onError: () => {
      toast.error("Failed to evaluate quality gates");
    },
  });

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      await evaluateMutation.mutateAsync();
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qualityGateResult) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Unable to load quality gates
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? "text-green-600" : "text-red-600";
  };

  const getDeploymentIcon = () => {
    if (deploymentLoading)
      return <RefreshCw className="h-5 w-5 animate-spin" />;
    return deploymentGate?.canDeploy ? (
      <Unlock className="h-5 w-5 text-green-600" />
    ) : (
      <Lock className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Quality Gates Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quality Gates
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={qualityGateResult.passed ? "default" : "destructive"}
              className="text-xs"
            >
              {qualityGateResult.passed ? "PASSED" : "FAILED"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEvaluate}
              disabled={isEvaluating}
            >
              {isEvaluating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Re-evaluate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {getStatusIcon(qualityGateResult.passed)}
                <div>
                  <div className="font-medium">
                    Quality Gate{" "}
                    {qualityGateResult.passed ? "Passed" : "Failed"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Score: {qualityGateResult.score}%
                  </div>
                </div>
              </div>
              <Progress value={qualityGateResult.score} className="w-24 h-2" />
            </div>

            {/* Deployment Status */}
            {deploymentGate && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getDeploymentIcon()}
                  <div>
                    <div className="font-medium">
                      Deployment{" "}
                      {deploymentGate.canDeploy ? "Allowed" : "Blocked"}
                    </div>
                    {deploymentGate.reason && (
                      <div className="text-sm text-muted-foreground">
                        {deploymentGate.reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Blockers */}
            {qualityGateResult.blockers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Blockers ({qualityGateResult.blockers.length})
                </h4>
                <div className="space-y-1">
                  {qualityGateResult.blockers.map((blocker, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded"
                    >
                      {blocker}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {qualityGateResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({qualityGateResult.warnings.length})
                </h4>
                <div className="space-y-1">
                  {qualityGateResult.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded"
                    >
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success State */}
            {qualityGateResult.passed &&
              qualityGateResult.blockers.length === 0 &&
              qualityGateResult.warnings.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-600">
                    All Quality Gates Passed!
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your project meets all quality standards and is ready for
                    deployment.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Gate Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quality Gate Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Min Maintainability Score:</span>
                <span className="font-medium">70%</span>
              </div>
              <div className="flex justify-between">
                <span>Min Security Score:</span>
                <span className="font-medium">80%</span>
              </div>
              <div className="flex justify-between">
                <span>Max Critical Issues:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Max Technical Debt:</span>
                <span className="font-medium">8 hours</span>
              </div>
              <div className="flex justify-between">
                <span>Requires Code Review:</span>
                <span className="font-medium">Yes</span>
              </div>
              <div className="flex justify-between">
                <span>Block on Security Issues:</span>
                <span className="font-medium">Yes</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Quality Gates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
