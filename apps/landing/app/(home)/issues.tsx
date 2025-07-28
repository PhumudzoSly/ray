import { Cpu, Lock, Sparkles, Zap } from "lucide-react";

export default function Issues() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl space-y-12 px-6">
        <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
          <h2 className="text-4xl font-semibold">
            <span className="font-bold text-primary">AI</span> won't solve every
            challenge,
            <br className="hidden md:inline" />
            but it will help you conquer the ones that matter.
          </h2>
          <p className="max-w-sm sm:ml-auto">
            Supercharge your workflow with collaborative, AI-driven issue
            tracking. Build better products, faster, together.
          </p>
        </div>
        <div className="relative rounded-3xl p-3 md:-mx-8 lg:col-span-3">
          <div className="aspect-[88/30] relative">
            <div className="bg-gradient-to-t z-1 from-background absolute inset-0 to-transparent"></div>
            <img
              src="/app/issues-2.png"
              className="absolute inset-0 z-10"
              alt="payments illustration dark"
              width={2797}
              height={1137}
            />
            <img
              src="/app/issues-2.png"
              className="hidden dark:block"
              alt="payments illustration dark"
              width={2797}
              height={1137}
            />
            <img
              src="/app/issues-2.png"
              className="dark:hidden"
              alt="payments illustration light"
              width={2797}
              height={1137}
            />
          </div>
        </div>
        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Deliver faster</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Fix issues and bugs faster, keep your users happy and engaged.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Powerful</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Simple but powerful enough for your entire team.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />

              <h3 className="text-sm font-medium">AI Powered</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Turn incoming feedback into actionable issues with AI.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4" />

              <h3 className="text-sm font-medium">Collaborative</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Work together to solve issues and build better products.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
