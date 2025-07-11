"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Users, MapPin, Building } from "lucide-react";

interface AdopterProfilesTabProps {
  profiles: any[];
}

export const AdopterProfilesTab: React.FC<AdopterProfilesTabProps> = ({
  profiles,
}) => {
  if (!profiles || profiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No adopter profiles available</p>
        </CardContent>
      </Card>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Early Adopter Profiles
          </CardTitle>
          <CardDescription>
            Detailed profiles of potential early adopters and target customers
          </CardDescription>
        </CardHeader>
      </Card>

      {profiles.map((profile: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>{profile.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Characteristics */}
              <div>
                <h4 className="font-medium mb-3">Characteristics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Tech Savviness
                    </span>
                    <Badge
                      variant="outline"
                      className={getLevelColor(profile.techSavviness)}
                    >
                      {profile.techSavviness}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Innovativeness
                    </span>
                    <Badge
                      variant="outline"
                      className={getLevelColor(profile.innovativeness)}
                    >
                      {profile.innovativeness}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Risk Tolerance
                    </span>
                    <Badge
                      variant="outline"
                      className={getLevelColor(profile.riskTolerance)}
                    >
                      {profile.riskTolerance}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.industry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.industry}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {profile.channelsWhereToFind && (
                <div>
                  <h5 className="font-medium text-sm mb-1">Where to Find</h5>
                  <p className="text-sm text-muted-foreground">
                    {profile.channelsWhereToFind}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
