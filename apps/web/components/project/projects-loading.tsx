import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

export const PROJECT_STATUSES = [
  { id: "planning", label: "Planning", color: "bg-blue-500" },
  { id: "in-progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "review", label: "Review", color: "bg-purple-500" },
  { id: "completed", label: "Completed", color: "bg-green-500" },
];

interface ProjectsLoadingProps {
  view: "kanban" | "table";
}

export function ProjectsLoading({ view }: ProjectsLoadingProps) {
  if (view === "table") {
    return (
      <div className="border rounded-lg p-2">
        <div className="p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full p-2">
      {PROJECT_STATUSES.map((status) => (
        <div key={status.id} className="flex-1 min-w-[300px]">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              <div className="h-5 bg-muted rounded w-20 animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex gap-1">
                      <div className="h-5 bg-muted rounded w-12" />
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
