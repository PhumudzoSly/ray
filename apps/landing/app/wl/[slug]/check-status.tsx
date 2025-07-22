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
  Search,
  Users,
  TrendingUp,
  Mail,
  Check,
  Copy,
  Twitter,
  Linkedin,
  MessageCircle,
  UserCheck,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { checkWaitlistEntry } from "@/actions/waitlist";
import { Separator } from "@workspace/ui/components/separator";

const checkStatusSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
});

type CheckStatusForm = z.infer<typeof checkStatusSchema>;

interface CheckStatusProps {
  waitlistId: string;
  waitlistName: string;
  waitlistSlug: string;
}

export function CheckStatus({
  waitlistId,
  waitlistName,
  waitlistSlug,
}: CheckStatusProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [entryData, setEntryData] = useState<any>(null);

  const form = useForm<CheckStatusForm>({
    resolver: zodResolver(checkStatusSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: CheckStatusForm) => {
    setIsChecking(true);

    try {
      const result = await checkWaitlistEntry({
        waitlistId,
        email: data.email,
      });

      if (result.success && result.data) {
        setEntryData(result.data);
        toast.success("Found your waitlist entry!");
      } else {
        toast.error(result.error || "Email not found on this waitlist");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const shareUrl = `${window.location.origin}/wl/${waitlistSlug}?ref=${entryData?.entry.referralCode}`;

  const handleShare = (platform: string) => {
    const text = `Join me on the waitlist for ${waitlistName}!`;
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

  if (entryData) {
    return (
      <div className="space-y-8">
        <div className="text-left">
          <h2 className="text-3xl font-bold mb-4">Welcome back!</h2>
          <p className="text-xl text-muted-foreground mb-8">
            You're currently position #{entryData.entry.position} in the{" "}
            {waitlistName} waitlist.
          </p>
        </div>
        <Separator />

        {/* Stats Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Your Status */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Your Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Position</span>
                <span className="font-semibold text-lg">
                  #{entryData.entry.position}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-semibold capitalize">
                  {entryData.entry.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="font-semibold">
                  {new Date(entryData.entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              {entryData.entry.verifiedAt && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Verified
                  </span>
                  <span className="font-semibold">
                    {new Date(entryData.entry.verifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Referral Stats */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Referral Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  People Referred
                </span>
                <span className="font-semibold">
                  {entryData.referredPeople.length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  Referral Code
                </span>
                <span className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded">
                  {entryData.entry.referralCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Referred People */}
        {entryData.referredPeople.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                People You've Referred ({entryData.referredPeople.length})
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              These people joined using your referral link
            </p>
            <div className="space-y-3">
              {entryData.referredPeople.map((person: any) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {person.name || person.email.split("@")[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Position #{person.position}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(person.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {person.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Share your referral link</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your unique referral link with friends and help grow the
            community!
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-sm" />
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
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setEntryData(null);
              form.reset();
            }}
          >
            Check Another Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left space-y-2">
        <h2 className="text-2xl font-semibold">Check Your Status</h2>
        <p className="text-muted-foreground">
          Enter your email to see your position and referral code.
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

        <Button type="submit" className="w-full h-11" disabled={isChecking}>
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Check Status
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
