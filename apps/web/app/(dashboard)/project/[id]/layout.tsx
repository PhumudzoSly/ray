import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { ProjectSidebar } from "./_components/project-sidebar";
import { ProjectContent } from "./_components/project-content";
import { ProjectLayoutWrapper } from "./_components/project-layout-wrapper";
import { ErrorBoundary } from "./_components/error-boundary";
import { ReactNode } from "react";
import Header from "@/components/shared/header";
import * as projectActions from "@/actions/project";
import { getSession } from "@/actions/account/user";
import getQueryClient from "@/lib/query/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";

// Route segment config for caching
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = "force-dynamic"; // Force dynamic rendering for real-time data

interface ProjectLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params;
  const { token } = await getSession();
  const queryClient = getQueryClient();

  // Prefetch project data
  await queryClient.prefetchQuery({
    queryKey: ["project", id],
    queryFn: () => projectActions.getProject(id),
  });

  // Prefetch related data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["project-health", id],
      queryFn: () => projectActions.getProjectHealthSummary(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["project-activity", id],
      queryFn: () => projectActions.getProjectInsights(id),
    }),
  ]);

  const project = queryClient.getQueryData(["project", id]) as any;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary>
        <Header
          crumb={[
            {
              title: "Projects",
              url: "/project",
            },
            {
              title: project?.name || "",
              url: `/project/${project?.id}`,
            },
          ]}
        >
          {null}
        </Header>
        {project === undefined ? (
          <LoadingSpinner />
        ) : project === null ? (
          <div className="flex-1 flex items-center mt-10 justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-3">Project not found</h1>
              <p className="text-muted-foreground max-w-md">
                We couldn't find the project you're looking for. It may have
                been deleted or you may not have access.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/project">Back to Projects</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ProjectLayoutWrapper
            projectId={project.id}
            fallback={
              <ExpandedLayoutContainer
                sidebar={
                  <ErrorBoundary>
                    <Suspense
                      fallback={<div className="p-4">Loading sidebar...</div>}
                    >
                      <ProjectSidebar projectId={project.id} />
                    </Suspense>
                  </ErrorBoundary>
                }
              >
                <ErrorBoundary>
                  <Suspense
                    fallback={<div className="p-4">Loading content...</div>}
                  >
                    <ProjectContent projectId={project.id} token={token}>
                      {children}
                    </ProjectContent>
                  </Suspense>
                </ErrorBoundary>
              </ExpandedLayoutContainer>
            }
          >
            {children}
          </ProjectLayoutWrapper>
        )}
      </ErrorBoundary>
    </HydrationBoundary>
  );
}
