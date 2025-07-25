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
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import {
  AlertTriangle,
  Clock,
  Code,
  Cpu,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { getTechnologyAssessment } from "@/actions/idea/insights";

interface TechnologyAssessmentProps {
  ideaId: string;
}

const complexityColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
};

const integrationComplexityColors = {
  SIMPLE: "bg-green-100 text-green-800 border-green-200",
  MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  COMPLEX: "bg-red-100 text-red-800 border-red-200",
};

export function TechnologyAssessment({ ideaId }: TechnologyAssessmentProps) {
  const {
    data: assessmentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["technology-assessment", ideaId],
    queryFn: () => getTechnologyAssessment(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technology Assessment</CardTitle>
          <CardDescription>
            Technical feasibility and development analysis
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

  if (error || assessmentData?.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technology Assessment</CardTitle>
          <CardDescription>
            Technical feasibility and development analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Failed to load technology assessment
          </div>
        </CardContent>
      </Card>
    );
  }

  const assessment = assessmentData?.data;

  if (!assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technology Assessment</CardTitle>
          <CardDescription>
            Technical feasibility and development analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No technology assessment available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const getComplexityLevel = (score: number) => {
    if (score <= 3) return "LOW";
    if (score <= 7) return "MEDIUM";
    return "HIGH";
  };

  const complexityLevel = getComplexityLevel(
    assessment.technicalComplexity || 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Assessment</CardTitle>
        <CardDescription>
          Technical feasibility and development analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Technical Complexity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <h4 className="font-medium">Technical Complexity</h4>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Complexity Score</span>
                  <span>{assessment.technicalComplexity}/10</span>
                </div>
                <Progress
                  value={(assessment.technicalComplexity || 0) * 10}
                  className="h-2"
                />
              </div>
              <Badge
                variant="outline"
                className={
                  complexityColors[
                    complexityLevel as keyof typeof complexityColors
                  ]
                }
              >
                {complexityLevel}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Development Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h4 className="font-medium">Development Timeline</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated Duration
                </p>
                <p className="text-lg font-medium">
                  {assessment.developmentTimeline} months
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Team Size Required
                </p>
                <p className="text-lg font-medium">
                  {assessment.teamSize} developers
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tech Stack */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <h4 className="font-medium">Recommended Tech Stack</h4>
            </div>
            {assessment.recommendedTechStack &&
            assessment.recommendedTechStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assessment.recommendedTechStack.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tech stack recommendations available
              </p>
            )}
          </div>

          {assessment.alternativeTechStacks &&
            assessment.alternativeTechStacks.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Alternative Tech Stacks</h4>
                  <div className="space-y-2">
                    {assessment.alternativeTechStacks.map((stack, index) => (
                      <div key={index} className="flex flex-wrap gap-2">
                        {stack.split(",").map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          <Separator />

          {/* Integration Complexity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <h4 className="font-medium">Integration Complexity</h4>
            </div>
            <Badge
              variant="outline"
              className={
                integrationComplexityColors[
                  assessment.integrationComplexity as keyof typeof integrationComplexityColors
                ]
              }
            >
              {assessment.integrationComplexity}
            </Badge>
          </div>

          <Separator />

          {/* Technical Risks */}
          {assessment.technicalRisks &&
            assessment.technicalRisks.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <h4 className="font-medium">Technical Risks</h4>
                  </div>
                  <ul className="space-y-2">
                    {assessment.technicalRisks.map((risk, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-red-500 mt-1">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
              </>
            )}

          {/* Mitigation Strategies */}
          {assessment.mitigationStrategies &&
            assessment.mitigationStrategies.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <h4 className="font-medium">Mitigation Strategies</h4>
                  </div>
                  <ul className="space-y-2">
                    {assessment.mitigationStrategies.map((strategy, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
              </>
            )}

          {/* Scalability Challenges */}
          {assessment.scalabilityChallenges &&
            assessment.scalabilityChallenges.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">Scalability Challenges</h4>
                  <ul className="space-y-2">
                    {assessment.scalabilityChallenges.map(
                      (challenge, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-yellow-500 mt-1">•</span>
                          {challenge}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <Separator />
              </>
            )}

          {/* Security Considerations */}
          {assessment.securityConsiderations &&
            assessment.securityConsiderations.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <h4 className="font-medium">Security Considerations</h4>
                  </div>
                  <ul className="space-y-2">
                    {assessment.securityConsiderations.map(
                      (consideration, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          {consideration}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <Separator />
              </>
            )}

          {/* Technical Advantages */}
          {assessment.technicalAdvantages &&
            assessment.technicalAdvantages.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">Technical Advantages</h4>
                  <ul className="space-y-2">
                    {assessment.technicalAdvantages.map((advantage, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
              </>
            )}

          {/* Innovation Potential */}
          {assessment.innovationPotential && (
            <div className="space-y-3">
              <h4 className="font-medium">Innovation Potential</h4>
              <p className="text-sm text-muted-foreground">
                {assessment.innovationPotential}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
