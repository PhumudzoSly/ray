import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Calendar, ChevronDown, ChevronRight, Link } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface ChangelogEntry {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  breaking?: boolean;
  issue?: any;
  feature?: any;
}

interface ChangelogItem {
  title: string;
  description: string;
  status: string;
}

interface Changelog {
  id: string;
  title: string;
  description: string;
  version?: string;
  publishDate: number;
  entries: ChangelogEntry[];
  items: ChangelogItem[];
}

interface RoadmapChangelogViewProps {
  changelogs: Changelog[] | undefined;
}

const CHANGELOG_ENTRY_TYPES = [
  { value: "FEATURE", label: "Feature", color: "bg-green-500" },
  { value: "FIX", label: "Fix", color: "bg-blue-500" },
  { value: "IMPROVEMENT", label: "Improvement", color: "bg-purple-500" },
  { value: "BREAKING", label: "Breaking Change", color: "bg-red-500" },
];

export function RoadmapChangelogView({
  changelogs,
}: RoadmapChangelogViewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Debug logging
  console.log("Changelogs data:", changelogs);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getTypeColor = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find((t) => t.value === type);
    return typeConfig?.color || "bg-gray-500";
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find((t) => t.value === type);
    return typeConfig?.label || type;
  };

  const groupEntriesByType = (entries: ChangelogEntry[]) => {
    const grouped: { [key: string]: ChangelogEntry[] } = {};
    entries.forEach((entry) => {
      if (!grouped[entry.type]) {
        grouped[entry.type] = [];
      }
      grouped[entry.type]?.push(entry);
    });
    return grouped;
  };

  if (!changelogs || changelogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">No changelog entries yet</h3>
        <p className="text-muted-foreground">
          Check back soon for updates on our progress
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader className="border-b">
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Changes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changelogs.map((changelog) => {
            const isExpanded = expandedRows.has(changelog.id);
            const hasEntries =
              changelog.entries && changelog.entries.length > 0;
            const groupedEntries = hasEntries
              ? groupEntriesByType(changelog.entries)
              : {};

            // Debug logging for each changelog
            console.log(`Changelog ${changelog.id}:`, {
              hasEntries,
              entriesLength: changelog.entries?.length,
              entries: changelog.entries,
              groupedEntries,
            });

            return (
              <>
                <TableRow
                  key={changelog.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRow(changelog.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Collapsible>
                      <CollapsibleTrigger className="p-1 hover:bg-muted rounded">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </CollapsibleTrigger>
                    </Collapsible>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{changelog.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {changelog.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {changelog.version && (
                      <Badge variant="outline" className="text-xs">
                        {changelog.version}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(changelog.publishDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {hasEntries ? (
                      <Badge variant="secondary" className="text-xs">
                        {changelog.entries.length} items
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <Collapsible open={isExpanded}>
                        <CollapsibleContent className="p-6 bg-muted/20">
                          {hasEntries ? (
                            <div className="space-y-4">
                              {Object.entries(groupedEntries).map(
                                ([type, entries]) => (
                                  <div key={type} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${getTypeColor(type)}`}
                                      />
                                      <span className="font-medium text-sm">
                                        {getTypeLabel(type)}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {entries.length}
                                      </Badge>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                      {entries.map(
                                        (entry: any, index: number) => (
                                          <div
                                            key={entry.id || index}
                                            className="py-2 group"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                  {entry.title}
                                                </div>
                                                {entry.description && (
                                                  <div className="text-sm text-muted-foreground mt-1">
                                                    {entry.description}
                                                  </div>
                                                )}
                                                {(entry.issue ||
                                                  entry.feature) && (
                                                  <div className="text-xs text-muted-foreground mt-1">
                                                    {entry.issue &&
                                                      `Issue: ${entry.issue.title}`}
                                                    {entry.issue &&
                                                      entry.feature &&
                                                      " • "}
                                                    {entry.feature &&
                                                      `Feature: ${entry.feature.name}`}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No entries in this changelog
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
