"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card";
import { Plus, Edit, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import NoData from "@/components/shared/no-data";

interface RoadmapChangelogsProps {
  changelogs: any[];
  onCreateChangelog: () => void;
}

export function RoadmapChangelogs({
  changelogs,
  onCreateChangelog,
}: RoadmapChangelogsProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planned":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      case "done":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Changelogs</h2>
          <p className="text-muted-foreground text-sm">
            Keep your users informed about roadmap updates and new features.
          </p>
        </div>
        <Button onClick={onCreateChangelog}>
          <Plus className="w-4 h-4 mr-2" />
          New Changelog
        </Button>
      </div>

      {/* Changelogs List */}
      <div className="space-y-4">
        {changelogs === undefined ? (
          // Loading skeleton
          [...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : changelogs.length === 0 ? (
          <NoData title="No Changelogs" />
        ) : (
          changelogs.map((changelog) => (
            <Card key={changelog.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{changelog.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(changelog.publishDate), "MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={changelog.isPublished ? "default" : "secondary"}
                  >
                    {changelog.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{changelog.description}</p>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">
                    Items ({changelog.items.length})
                  </h4>
                  <div className="space-y-2">
                    {changelog.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(
                            item.status
                          )}`}
                        ></div>
                        <div>
                          <h5 className="font-medium">{item.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {!changelog.isPublished && (
                  <Button size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
