import { Card, CardContent } from "@workspace/ui/components/card";
import { Shield, Users } from "lucide-react";
import Image from "next/image";

export default function Features() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
            Your next SaaS... <br />
            <span className="text-muted-foreground">
              Does not have to fail.
            </span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Stop second-guessing your next big move. Get real feedback,
            actionable insights, and the clarity you need to launch products
            that people actually want.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {/* SaaS Idea Validation - Large Card */}
          <Card className="lg:col-span-2 p-8 border-2 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <svg
                  className="text-muted-foreground/30 w-56 h-24"
                  viewBox="0 0 254 104"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-foreground">
                    100%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  SaaS Idea Validation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Validate your ideas before building
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Market Fit */}
          <Card className="md:col-span-1 lg:col-span-2 p-6 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 flex flex-col items-center text-center space-y-6">
              <div className="flex-shrink-0">
                <Image
                  src="/svg/happy-man.svg"
                  height={80}
                  width={80}
                  alt="Product market fit illustration"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Product market fit.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Find product market fit before you build, save hours of
                  development and deliver a product that users love.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Management */}
          <Card className="md:col-span-1 lg:col-span-2 p-6 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 space-y-6">
              <div className="w-full flex items-center justify-center ">
                <Image
                  height={70}
                  width={70}
                  src="/svg/chart-grow.svg"
                  alt="Product management"
                />
              </div>
              <div className="space-y-3 text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  Product management
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Manage your entire SaaS from one place. Manage features,
                  launches, and feedback.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Matters */}
          <Card className="lg:col-span-3 p-6 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 grid md:grid-cols-2 gap-6 h-full">
              <div className="flex flex-col justify-between space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                  <Shield
                    className="h-5 w-5 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Feedback matters
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Collect feedback from your waitlist or app users, turn it
                    into issues, reviews or product features.
                  </p>
                </div>
              </div>
              <div className="relative bg-muted/30 rounded-lg border p-6 overflow-hidden">
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Image
                    height={120}
                    width={160}
                    alt="Feedback illustration"
                    src="/svg/feedback.svg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Waitlist */}
          <Card className="lg:col-span-3 p-6 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 grid md:grid-cols-2 gap-6 h-full">
              <div className="flex flex-col justify-between space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                  <Users
                    className="h-6 w-6 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Enhanced Waitlist
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Collect waitlist users for product launches and new features
                    and sync with Resend.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 w-px bg-border mx-auto"></div>
                <div className="relative flex flex-col justify-center space-y-6 py-6">
                  <div className="flex items-center justify-end gap-3 pr-4">
                    <span className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                      Riley
                    </span>
                    <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-background shadow-sm">
                      <img
                        className="h-full w-full object-cover"
                        src="https://randomuser.me/api/portraits/men/15.jpg"
                        alt="Riley"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-background shadow-sm">
                      <img
                        className="h-full w-full object-cover"
                        src="https://randomuser.me/api/portraits/women/21.jpg"
                        alt="Avery"
                      />
                    </div>
                    <span className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                      Avery
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3 pr-4">
                    <span className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                      Jordan
                    </span>
                    <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-background shadow-sm">
                      <img
                        className="h-full w-full object-cover"
                        src="https://randomuser.me/api/portraits/men/28.jpg"
                        alt="Jordan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
