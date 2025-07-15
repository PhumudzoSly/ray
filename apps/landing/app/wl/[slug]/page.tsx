"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  Users,
  TrendingUp,
  Mail,
  Share2,
  Check,
  Loader2,
  Copy,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const joinWaitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required").optional(),
});

type JoinWaitlistForm = z.infer<typeof joinWaitlistSchema>;

export default function PublicWaitlistPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const referralCode = searchParams.get("ref");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState<string>("");
  const [position, setPosition] = useState<number>(0);

  // Fetch waitlist data
  const waitlist = useQuery(api.waitlists.getWaitlistBySlug, { slug });

  const form = useForm<JoinWaitlistForm>({
    resolver: zodResolver(joinWaitlistSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (data: JoinWaitlistForm) => {
    if (!waitlist) return;

    setIsSubmitting(true);

    try {
      // Get UTM parameters
      const utmSource = searchParams.get("utm_source") || undefined;
      const utmMedium = searchParams.get("utm_medium") || undefined;
      const utmCampaign = searchParams.get("utm_campaign") || undefined;

      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          waitlistId: waitlist._id,
          email: data.email,
          name: data.name,
          referredBy: referralCode,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsJoined(true);
        // You would typically get this from the response
        setUserReferralCode("ABC123"); // Placeholder
        setPosition(waitlist.stats.totalEntries + 1);
        toast.success("Successfully joined the waitlist!");
      } else {
        toast.error(result.error || "Failed to join waitlist");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = `${window.location.origin}/wl/${slug}?ref=${userReferralCode}`;

  const handleShare = (platform: string) => {
    const text = `Join me on the waitlist for ${waitlist?.name}!`;
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  if (!waitlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold mb-4">You're on the waitlist!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thanks for joining {waitlist.name}. You're currently position #
              {position} in line.
            </p>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Want to move up faster?
                </CardTitle>
                <CardDescription>
                  Share your unique referral link with friends. For every person
                  who joins through your link, you'll move up one position!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyToClipboard} size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("linkedin")}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("whatsapp")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
              <p>We'll email you when it's your turn for early access.</p>
              <p>
                Check your email to verify your address and secure your spot!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold">{waitlist.name}</h1>
              <Badge variant="secondary">{waitlist.project?.name}</Badge>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              {waitlist.description}
            </p>

            {waitlist.showSocialProof && waitlist.stats && (
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {waitlist.stats.totalEntries}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    people joined
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {waitlist.stats.verifiedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {waitlist.stats.todayCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    joined today
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Join Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join the Waitlist
              </CardTitle>
              <CardDescription>
                {referralCode
                  ? "You've been referred by a friend! Join now to secure your spot."
                  : "Get early access and be among the first to try our new features."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {waitlist.allowNameCapture && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              </form>

              {waitlist.customMessage && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {waitlist.customMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>
              By joining, you agree to receive updates about{" "}
              {waitlist.project?.name}.
            </p>
            <p>We'll never spam you or share your email with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
