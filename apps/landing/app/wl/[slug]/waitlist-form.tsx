"use client";

import { useState } from "react";
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
import {
  Users,
  TrendingUp,
  Mail,
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
import { joinWaitlist } from "@/actions/waitlist";
import { Waitlist } from "@workspace/backend/prisma/generated/client";

// Extended type to include the additional properties returned by getWaitlistBySlug
type WaitlistWithStats = Waitlist & {
  stats?: {
    totalEntries: number;
    verifiedCount: number;
    todayCount: number;
  };
  project?: {
    name: string;
  };
};

const joinWaitlistSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  name: z.string().max(100, "Name is too long").optional(),
});

type JoinWaitlistForm = z.infer<typeof joinWaitlistSchema>;

interface WaitlistFormProps {
  waitlist: WaitlistWithStats;
  referralCode?: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function WaitlistForm({
  waitlist,
  referralCode,
  searchParams,
}: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState<string>("");
  const [position, setPosition] = useState<number>(0);

  const form = useForm<JoinWaitlistForm>({
    resolver: zodResolver(joinWaitlistSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (data: JoinWaitlistForm) => {
    setIsSubmitting(true);

    try {
      // Get UTM parameters
      const utmSource = (searchParams.utm_source as string) || undefined;
      const utmMedium = (searchParams.utm_medium as string) || undefined;
      const utmCampaign = (searchParams.utm_campaign as string) || undefined;

      const result = await joinWaitlist({
        waitlistId: waitlist.id,
        email: data.email,
        name: data.name,
        referredBy: referralCode,
        utmSource,
        utmMedium,
        utmCampaign,
      });

      if (result.success && result.data) {
        setIsJoined(true);
        setUserReferralCode(result.data.referralCode);
        setPosition(result.data.position);
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

  const shareUrl = `${window.location.origin}/wl/${waitlist.slug}?ref=${userReferralCode}`;

  const handleShare = (platform: string) => {
    const text = `Join me on the waitlist for ${waitlist.name}!`;
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
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

  if (isJoined) {
    return (
      <div className="space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 border border-green-200 rounded-full mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">You're on the waitlist!</h2>
          <p className="text-muted-foreground">
            Thanks for joining {waitlist.name}. You're currently position #
            {position} in line.
          </p>
        </div>

        {/* Referral Section */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Share your referral link</h3>
            <p className="text-sm text-muted-foreground">
              Share your unique referral link with friends and help grow the
              community!
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm h-10"
              />
              <Button onClick={copyToClipboard} size="sm" className="h-10 px-3">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("twitter")}
                className="h-9"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("linkedin")}
                className="h-9"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("whatsapp")}
                className="h-9"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            We'll email you when it's your turn for early access.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Check your email to verify your address and secure your spot!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left space-y-2">
        <h2 className="text-2xl font-semibold">Join the Waitlist</h2>
        <p className="text-muted-foreground text-sm">
          {referralCode
            ? "You've been referred by a friend! Join now to secure your spot."
            : "Get early access and be among the first to try our new features."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="h-11"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {waitlist.allowNameCapture && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name (Optional)
            </Label>
            <Input
              id="name"
              placeholder="Your name"
              className="h-11"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
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

      {/* Custom Message */}
      {waitlist.customMessage && (
        <div className="p-4 bg-muted/50 border border-border/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {waitlist.customMessage}
          </p>
        </div>
      )}
    </div>
  );
}
