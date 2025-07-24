import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRoadmapBySlug } from "@/actions/roadmap";
import { RoadmapClientPage } from "./roadmap-client-page";
import type { Metadata } from "next";

interface RoadmapPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { success, data: roadmap } = await getRoadmapBySlug(slug);

  if (!success || !roadmap) {
    return {
      title: "Roadmap Not Found",
      description: "The requested roadmap could not be found.",
    };
  }

  return {
    title: `${roadmap.name} - Product Roadmap`,
    description: roadmap.description,
    openGraph: {
      title: `${roadmap.name} - Product Roadmap`,
      description: roadmap.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${roadmap.name} - Product Roadmap`,
      description: roadmap.description,
    },
  };
}

export default async function PublicRoadmapPage({ params }: RoadmapPageProps) {
  const { slug } = await params;

  // Fetch roadmap data on the server
  const { success, data: roadmap } = await getRoadmapBySlug(slug);

  if (!success || !roadmap) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <RoadmapClientPage roadmap={roadmap} />
    </Suspense>
  );
}
