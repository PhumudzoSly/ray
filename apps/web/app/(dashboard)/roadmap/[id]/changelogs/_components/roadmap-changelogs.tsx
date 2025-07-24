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
import { Plus, Edit, Calendar, Globe, Tag, Link, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import NoData from "@/components/shared/no-data";

interface RoadmapChangelogsProps {
  changelogs: any[];
  onCreateChangelog: () => void;
}

const CHANGELOG_ENTRY_TYPES = [
  { value: "FEATURE", label: "Feature", color: "bg-green-500" },
  { value: "FIX", label: "Fix", color: "bg-blue-500" },
  { value: "IMPROVEMENT", label: "Improvement", color: "bg-purple-500" },
  { value: "BREAKING", label: "Breaking Change", color: "bg-red-500" },
  { value: "SECURITY", label: "Security", color: "bg-orange-500" },
  { value: "DEPRECATION", label: "Deprecation", color: "bg-yellow-500" },
  { value: "DOCUMENTATION", label: "Documentation", color: "bg-gray-500" },
  { value: "PERFORMANCE", label: "Performance", color: "bg-indigo-500" },
];

export function RoadmapChangelogs({
  changelogs,
  onCreateChangelog,
}: RoadmapChangelogsProps) {
  // Get type color
  const getTypeColor = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find(t => t.value === type);
    return typeConfig?.color || "bg-gray-500";
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  // Group entries by type
  const groupEntriesByType = (entries: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    entries.forEach(entry => {
      if (!grouped[entry.type]) {
        grouped[entry.type] = [];
      }
      grouped[entry.type].push(entry);
    });
    return grouped;
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
      <div className="space-y-6">
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
          changelogs.map((changelog) => {
            const groupedEntries = groupEntriesByType(changelog.entries || []);
            const hasEntries = changelog.entries && changelog.entries.length > 0;
            
            return (
              <Card key={changelog.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{changelog.title}</CardTitle>
                        {changelog.version && (
                          <Badge variant="outline" className="text-xs">
                            {changelog.version}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(changelog.publishDate), "MMMM d, yyyy")}
                        </span>
                        {hasEntries && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {changelog.entries.length} entries
                          </span>
                        )}
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
                  <p className="whitespace-pre-line mb-6">{changelog.description}</p>

                  {/* Enhanced Entries Display */}
                  {hasEntries ? (
                    <div className="space-y-6">
                      {Object.entries(groupedEntries).map(([type, entries]) => (
                        <div key={type} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                            <h4 className="font-medium text-sm uppercase tracking-wide">
                              {getTypeLabel(type)}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {entries.length}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 ml-5">
                            {entries.map((entry: any, index: number) => (
                              <div key={entry.id || index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-medium text-sm">{entry.title}</h5>
                                    {entry.breaking && (
                                      <Badge variant="destructive" className="text-xs">
                                        Breaking
                                      </Badge>
                                    )}
                                    {entry.priority && (
                                      <Badge variant="outline" className="text-xs">
                                        {entry.priority}
                                      </Badge>
                                    )}
                                    {entry.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {entry.category}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {entry.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {entry.description}
                                    </p>
                                  )}
                                  
                                  {/* Linked Items */}
                                  {(entry.issue || entry.feature) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Link className="w-3 h-3" />
                                      {entry.issue && (
                                        <span className="flex items-center gap-1">
                                          Issue: {entry.issue.title}
                                          <ExternalLink className="w-3 h-3" />
                                        </span>
                                      )}
                                      {entry.issue && entry.feature && " • "}
                                      {entry.feature && (
                                        <span className="flex items-center gap-1">
                                          Feature: {entry.feature.name}
                                          <ExternalLink className="w-3 h-3" />
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Legacy Support - Show old format if no entries */
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">
                        Items ({changelog.items?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {changelog.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                item.status === "NEW" ? "bg-green-500" : "bg-blue-500"
                              }`}
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
                  )}
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
            );
          })
        )}
      </div>
    </div>
  );
}
