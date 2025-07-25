"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Shield,
  XCircle,
} from "lucide-react";
import { getRegulatoryCompliance } from "@/actions/idea/insights";

interface RegulatoryComplianceProps {
  ideaId: string;
}

const complianceLevelColors = {
  COMPLIANT: "bg-green-100 text-green-800 border-green-200",
  PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NON_COMPLIANT: "bg-red-100 text-red-800 border-red-200",
};

const riskLevelColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

const complianceLevelIcons = {
  COMPLIANT: CheckCircle,
  PARTIAL: Clock,
  NON_COMPLIANT: XCircle,
};

export function RegulatoryCompliance({ ideaId }: RegulatoryComplianceProps) {
  const {
    data: complianceData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regulatory-compliance", ideaId],
    queryFn: () => getRegulatoryCompliance(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance</CardTitle>
          <CardDescription>
            Compliance status and regulatory requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || complianceData?.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance</CardTitle>
          <CardDescription>
            Compliance status and regulatory requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Failed to load regulatory compliance data
          </div>
        </CardContent>
      </Card>
    );
  }

  const compliance = complianceData?.data;

  if (!compliance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance</CardTitle>
          <CardDescription>
            Compliance status and regulatory requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No regulatory compliance data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const ComplianceIcon =
    complianceLevelIcons[
      compliance.complianceLevel as keyof typeof complianceLevelIcons
    ] || Clock;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regulatory Compliance</CardTitle>
        <CardDescription>
          Compliance status and regulatory requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Compliance Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <h4 className="font-medium">Overall Compliance Status</h4>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={
                  complianceLevelColors[
                    compliance.complianceLevel as keyof typeof complianceLevelColors
                  ]
                }
              >
                <ComplianceIcon className="h-3 w-3 mr-1" />
                {compliance.complianceLevel}
              </Badge>
              <Badge
                variant="outline"
                className={
                  riskLevelColors[
                    compliance.riskLevel as keyof typeof riskLevelColors
                  ]
                }
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {compliance.riskLevel} Risk
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Implementation Costs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <h4 className="font-medium">Implementation Requirements</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Implementation Cost
                </p>
                <p className="text-lg font-medium">
                  {compliance.implementationCosts
                    ? `$${compliance.implementationCosts.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-lg font-medium">
                  {compliance.implementationTimeline
                    ? `${compliance.implementationTimeline} months`
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Target Markets */}
          {compliance.targetMarkets && compliance.targetMarkets.length > 0 && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <h4 className="font-medium">Target Markets</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compliance.targetMarkets.map((market, index) => (
                    <Badge key={index} variant="secondary">
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Applicable Regulations */}
          {compliance.applicableRegulations &&
            compliance.applicableRegulations.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <h4 className="font-medium">Applicable Regulations</h4>
                  </div>
                  <div className="space-y-2">
                    {compliance.applicableRegulations.map(
                      (regulation, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-blue-500">•</span>
                          <span className="text-sm">{regulation}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

          {/* Industry Standards */}
          {compliance.industryStandards &&
            compliance.industryStandards.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">Industry Standards</h4>
                  <div className="space-y-2">
                    {compliance.industryStandards.map((standard, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <span className="text-sm">{standard}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

          {/* Certification Requirements */}
          {compliance.certificationRequirements &&
            compliance.certificationRequirements.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">Certification Requirements</h4>
                  <div className="space-y-2">
                    {compliance.certificationRequirements.map(
                      (certification, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-yellow-500">•</span>
                          <span className="text-sm">{certification}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

          {/* Local Regulations */}
          {compliance.localRegulations &&
            compliance.localRegulations.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">Local Regulations</h4>
                  <div className="space-y-2">
                    {compliance.localRegulations.map((regulation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        <span className="text-sm">{regulation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
