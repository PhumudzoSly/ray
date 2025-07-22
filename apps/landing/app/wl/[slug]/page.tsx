import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getWaitlistBySlug } from "@/actions/waitlist";
import { Badge } from "@workspace/ui/components/badge";
import { WaitlistForm } from "./waitlist-form";
import { CheckStatus } from "./check-status";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Users, Search, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface WaitlistPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PublicWaitlistPage({
  params,
  searchParams,
}: WaitlistPageProps) {
  const { slug } = await params;
  const searchParamsObj = await searchParams;
  const referralCode = searchParamsObj.ref as string | undefined;

  // Fetch waitlist data on the server
  const { success, data: waitlist } = await getWaitlistBySlug(slug);

  if (!success || !waitlist) {
    notFound();
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full">
        {/* Left Side - Form */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="min-h-full flex items-center justify-center p-8 lg:px-16">
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {waitlist.name}
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed"></p>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Good things come to those who join early
                </h2>
                <p className="text-muted-foreground">{waitlist.description}</p>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-xs font-medium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Launching soon
                </Badge>
                {waitlist.showSocialProof && waitlist.stats && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex -space-x-2">
                      {Array.from({
                        length: Math.min(
                          Math.max(1, waitlist.stats.totalEntries),
                          4
                        ),
                      }).map((_, idx) => {
                        // Generate a random uppercase letter
                        const randomLetter = String.fromCharCode(
                          65 + Math.floor(Math.random() * 26)
                        );
                        // Array of shadcn color gradients (using only shadcn variables)
                        const gradients = [
                          "from-[#6366f1] to-[#a5b4fc]", // indigo-500 to indigo-200
                          "from-[#10b981] to-[#6ee7b7]", // emerald-500 to emerald-300
                          "from-[#f59e42] to-[#fcd34d]", // amber-500 to amber-300
                          "from-[#f43f5e] to-[#fca5a5]", // rose-500 to rose-300
                          "from-[#3b82f6] to-[#60a5fa]", // blue-500 to blue-400
                        ];
                        // Pick a random gradient for each avatar
                        const gradient =
                          gradients[
                            Math.floor(Math.random() * gradients.length)
                          ];
                        return (
                          <div
                            key={idx}
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} border-2 border-background flex items-center justify-center text-xs font-semibold text-white`}
                          >
                            {randomLetter}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {waitlist.stats.totalEntries.toLocaleString()}+
                      </span>{" "}
                      people have already joined
                    </div>
                  </div>
                )}
              </div>

              {/* Form Tabs */}
              <Tabs
                defaultValue={referralCode ? "check" : "join"}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger value="join" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Join now
                  </TabsTrigger>
                  <TabsTrigger
                    value="check"
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Check status
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="join" className="mt-6">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground text-sm">
                          Loading form...
                        </div>
                      </div>
                    }
                  >
                    <WaitlistForm
                      waitlist={waitlist}
                      referralCode={referralCode}
                      searchParams={searchParamsObj}
                    />
                  </Suspense>
                </TabsContent>

                <TabsContent value="check" className="mt-6">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground text-sm">
                          Loading status checker...
                        </div>
                      </div>
                    }
                  >
                    <CheckStatus
                      waitlistId={waitlist.id}
                      waitlistName={waitlist.name}
                      waitlistSlug={waitlist.slug}
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  By joining, you agree to receive updates about{" "}
                  <span className="font-medium text-foreground">
                    {waitlist.project?.name || "this project"}
                  </span>
                  .
                </p>
                <p className="text-xs text-muted-foreground/60">
                  We'll never spam you or share your email with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden bg-[#F8F8F8] border-l lg:flex flex-1 items-center justify-center relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20" />

          {/* Placeholder Illustration */}
          <div className="relative z-10 max-w-xl mx-auto">
            <img
              src="/waitlist2.jpg"
              alt="Waitlist Illustration"
              className="object-contain w-full h-full min-h-full min-w-full"
            />
          </div>
        </div>
      </div>

      {/* Back to RayAI Link */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RayAI
        </Link>
      </div>
    </div>
  );
}
