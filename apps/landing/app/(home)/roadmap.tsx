import { BarChart3, Heart, MessageSquare, TrendingUp } from "lucide-react";

export default function Roadmap() {
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto max-w-7xl space-y-8 px-6 md:space-y-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-semibold lg:text-5xl">
            Public Roadmaps That Actually Convert
          </h2>
          <p className="mt-6 text-lg">
            Turn your roadmap into a customer acquisition engine. Let your
            community vote on features, provide feedback, and become invested in
            your product's future.
          </p>
        </div>
        <div className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3">
          <div className="[perspective:800px]">
            <div className="[transform:skewY(-2deg)skewX(-2deg)rotateX(6deg)]">
              <div className="aspect-[88/30] relative">
                <div className="[background-image:radial-gradient(var(--tw-gradient-stops,at_75%_25%))] to-background z-1 -inset-[4.25rem] absolute from-transparent to-75%"></div>
                <img
                  src="/app/roadmap.png"
                  className="absolute inset-0 z-10"
                  alt="Public roadmap with voting and community engagement"
                  width={2797}
                  height={1137}
                />
                <img
                  src="/app/roadmap.png"
                  className="hidden dark:block"
                  alt="Public roadmap with voting and community engagement"
                  width={2797}
                  height={1137}
                />
                <img
                  src="/app/roadmap.png"
                  className="dark:hidden"
                  alt="Public roadmap with voting and community engagement"
                  width={2797}
                  height={1137}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="size-4" />
              <h3 className="text-sm font-medium">Community Voting</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Let users vote on features they want most, creating engagement and
              product-market alignment.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              <h3 className="text-sm font-medium">Conversion Tracking</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Track how roadmap engagement converts visitors into paying
              customers and loyal users.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <h3 className="text-sm font-medium">Feedback Pipeline</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Transform feature requests into actionable roadmap items with
              AI-powered sentiment analysis.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              <h3 className="text-sm font-medium">Growth Engine</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Turn your roadmap from a static document into a dynamic tool that
              drives customer acquisition.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
