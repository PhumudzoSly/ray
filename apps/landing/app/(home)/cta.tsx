import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default function CTA() {
  return (
    <div className="max-w-7xl mx-auto mb-10">
      <div className="relative w-full  overflow-hidden rounded-[40px] border bg-background p-6 sm:p-10 md:p-20">
        <div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
          <div className="absolute right-[-45%] top-1/2 aspect-square h-[800px] w-[800px] -translate-y-1/2">
            <div className="absolute inset-0 rounded-full bg-primary opacity-30"></div>
            <div className="absolute inset-0 scale-[0.8] rounded-full bg-background opacity-20"></div>
            <div className="absolute inset-0 scale-[0.6] rounded-full bg-background opacity-20"></div>
            <div className="absolute inset-0 scale-[0.4] rounded-full bg-background opacity-20"></div>
            <div className="absolute inset-0 scale-[0.2] rounded-full bg-background opacity-20"></div>
            <div className="absolute inset-0 scale-[0.1] rounded-full bg-background opacity-20"></div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl md:mb-4 md:text-5xl">
            Build the next unicorn 🦄
          </h1>
          <p className="mb-6 max-w-md text-base sm:text-lg md:mb-8">
            Ready to build something that matters? Start your journey today.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button asChild>
              <Link href="/auth/sign-in" className="flex items-center gap-2">
                <span>Get started</span>
                <span className=" transition-opacity duration-300">→</span>
              </Link>
            </Button>
            <Button value="outline" asChild>
              <a
                href="https://getwaitlist.com/waitlist/25597"
                className="flex items-center gap-2"
              >
                <span>Talk to sales</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
