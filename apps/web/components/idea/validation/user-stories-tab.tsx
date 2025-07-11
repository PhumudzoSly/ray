"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { User, CheckCircle } from "lucide-react";

interface UserStoriesTabProps {
  stories: any[];
}

export const UserStoriesTab: React.FC<UserStoriesTabProps> = ({ stories }) => {
  if (!stories || stories.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No user stories available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {stories.map((story: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              {story.persona}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-medium">{story.story}</p>
              </div>

              {story.acceptanceCriteria &&
                story.acceptanceCriteria.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Acceptance Criteria
                    </h4>
                    <ul className="space-y-2">
                      {story.acceptanceCriteria.map(
                        (criteria: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            {criteria}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
