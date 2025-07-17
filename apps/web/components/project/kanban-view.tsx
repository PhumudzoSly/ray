import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@workspace/ui/components/badge";
import { ProjectCard } from "./project-card";

const PROJECT_STATUSES = [
  { id: "planning", label: "Planning", color: "bg-blue-500" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "review", label: "Review", color: "bg-purple-500" },
  { id: "completed", label: "Completed", color: "bg-green-500" },
];

interface KanbanViewProps {
  projects: any[];
  onDragEnd: (result: any) => void;
  onEditProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
}

export function KanbanView({
  projects,
  onDragEnd,
  onEditProject,
  onDeleteProject,
}: KanbanViewProps) {
  // Local state for optimistic updates
  const [optimisticProjects, setOptimisticProjects] = useState<any[]>([]);

  // Use optimistic projects if available, otherwise use props
  const displayProjects =
    optimisticProjects.length > 0 ? optimisticProjects : projects;

  // Group projects by status
  const projectsByStatus = PROJECT_STATUSES.reduce(
    (acc, status) => {
      acc[status.id] = displayProjects.filter(
        (project) => (project.status || "planning") === status.id
      );
      return acc;
    },
    {} as Record<string, typeof displayProjects>
  );

  // Update status counts
  const statusesWithCounts = PROJECT_STATUSES.map((status) => ({
    ...status,
    count: projectsByStatus[status.id]?.length || 0,
  }));

  // Handle drag end with optimistic updates
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Optimistic update
    const currentProjects =
      optimisticProjects.length > 0 ? optimisticProjects : projects;
    const updatedProjects = currentProjects.map((project) =>
      project.id === draggableId
        ? { ...project, status: destination.droppableId }
        : project
    );
    setOptimisticProjects(updatedProjects);

    try {
      // Call the parent's onDragEnd handler
      await onDragEnd(result);
      // Clear optimistic state on success
      setOptimisticProjects([]);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticProjects([]);
    }
  };

  const StatusColumn = ({
    status,
    projects,
  }: {
    status: any;
    projects: any[];
  }) => (
    <div className="flex-1 min-w-[300px]">
      <div className="bg-card p-2 rounded-md mb-2 border">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.color}`} />
            <h3 className="font-medium">{status.label}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {status.count}
          </Badge>
        </div>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            key={status.id}
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${snapshot.isDraggingOver
              ? "border-primary bg-primary/5"
              : "border-muted bg-muted/20"
              }`}
          >
            {projects.map((project, index) => (
              <Draggable
                key={project.id}
                draggableId={project.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    key={project.id}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 ${snapshot.isDragging ? "rotate-2 shadow-lg" : ""}`}
                  >
                    <ProjectCard
                      project={project}
                      variant="kanban"
                      isDragging={snapshot.isDragging}
                      onEdit={onEditProject}
                      onDelete={onDeleteProject}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {projects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">
                  No projects in {status.label.toLowerCase()}
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full p-2 overflow-x-auto pb-4">
        {statusesWithCounts.map((status) => (
          <StatusColumn
            key={status.id}
            status={status}
            projects={projectsByStatus[status.id] || []}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
