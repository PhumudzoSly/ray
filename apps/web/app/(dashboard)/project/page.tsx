"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { EnhancedProjectFilters } from "@/components/project/enhanced-project-filters";
import { KanbanView } from "@/components/project/kanban-view";
import { TableView } from "@/components/project/table-view";
import { ProjectsLoading } from "@/components/project/projects-loading";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import NoData from "@/components/shared/no-data";
import Header from "@/components/shared/header";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("updated-desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterAuth, setFilterAuth] = useState("");
  const [filterDatabase, setFilterDatabase] = useState("");
  const [filterOrm, setFilterOrm] = useState("");
  const [filterAi, setFilterAi] = useState("");
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const { token } = useSession();

  const projects = useQuery(api.projects.list, { token });
  const updateProjectStatus = useMutation(api.projects.updateStatus);

  // Get unique tech stack options for filters
  const availableOptions = {
    auths: [
      ...new Set(projects?.map((p) => p.techStack.auth.split(" ")[0]) || []),
    ],
    databases: [
      ...new Set(
        projects?.map((p) => p.techStack.database.split(" ")[0]) || []
      ),
    ],
    orms: [...new Set(projects?.map((p) => p.techStack.orm) || [])],
    ais: [...new Set(projects?.map((p) => p.techStack.ai) || [])],
  };

  // Filter projects based on search and filters
  const filteredProjects =
    projects?.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filterStatus || project.status === filterStatus;
      const matchesPlatform =
        !filterPlatform || project.platform === filterPlatform;
      const matchesAuth =
        !filterAuth || project.techStack.auth.split(" ")[0] === filterAuth;
      const matchesDatabase =
        !filterDatabase ||
        project.techStack.database.split(" ")[0] === filterDatabase;
      const matchesOrm = !filterOrm || project.techStack.orm === filterOrm;
      const matchesAi = !filterAi || project.techStack.ai === filterAi;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlatform &&
        matchesAuth &&
        matchesDatabase &&
        matchesOrm &&
        matchesAi
      );
    }) || [];

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "updated-desc":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "updated-asc":
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      default:
        return 0;
    }
  });

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const projectId = draggableId;
    const newStatus = destination.droppableId;

    try {
      await updateProjectStatus({
        projectId,
        status: newStatus,
        token,
      });
      toast.success("Project status updated");
    } catch (error) {
      console.error("Failed to update project status:", error);
      toast.error("Failed to update project status");
    }
  };

  const handleEditProject = (project: any) => {
    // TODO: Implement edit functionality
    console.log("Edit project:", project);
  };

  const handleDeleteProject = (project: any) => {
    // TODO: Implement delete functionality
    console.log("Delete project:", project);
  };

  return (
    <div>
      <Header
        crumb={[
          {
            title: "Projects",
            url: "/project",
          },
        ]}
      >
        <CreateProjectDialog />
      </Header>
      <div className="border-y p-2 5">
        <EnhancedProjectFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPlatform={filterPlatform}
          onFilterPlatformChange={setFilterPlatform}
          filterAuth={filterAuth}
          onFilterAuthChange={setFilterAuth}
          filterDatabase={filterDatabase}
          onFilterDatabaseChange={setFilterDatabase}
          filterOrm={filterOrm}
          onFilterOrmChange={setFilterOrm}
          filterAi={filterAi}
          onFilterAiChange={setFilterAi}
          availableOptions={availableOptions}
          view={view}
          onViewChange={setView}
        />
      </div>
      <div className="flex-1 overflow-hidden bg-background">
        <div className="flex-1 overflow-hidden">
          {projects === undefined ? (
            <ProjectsLoading view={view} />
          ) : projects.length === 0 ? (
            <NoData title="No projects found" />
          ) : view === "kanban" ? (
            <KanbanView
              projects={sortedProjects}
              onDragEnd={handleDragEnd}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          ) : (
            <TableView
              projects={sortedProjects}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
