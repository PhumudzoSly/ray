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
import { Mail, Loader2, Check, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const joinWaitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required").optional(),
});

type JoinWaitlistForm = z.infer<typeof joinWaitlistSchema>;

interface WaitlistJoinFormProps {
  waitlistId: string;
  waitlistName: string;
  description?: string;
  allowNameCapture?: boolean;
  showPosition?: boolean;
  customMessage?: string;
  referralCode?: string;
  className?: string;
  compact?: boolean;
}

export function WaitlistJoinForm({
  waitlistId,
  waitlistName,
  description,
  allowNameCapture = true,
  showPosition = true,
  customMessage,
  referralCode,
  className,
  compact = false,
}: WaitlistJoinFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
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
      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          waitlistId,
          email: data.email,
          name: data.name,
          referredBy: referralCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsJoined(true);
        setPosition(result.position || 0);
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

  if (isJoined) {
    return (
      <Card className={className}>
        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">You're on the waitlist!</h3>
              {showPosition && position > 0 && (
                <p className="text-muted-foreground">
                  You're position #{position} in line for {waitlistName}
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Check your email to verify your address and secure your spot!
              </p>
              <p>We'll notify you when it's your turn for early access.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <span className="font-medium text-sm">Join {waitlistName}</span>
            </div>

            <div className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                {...form.register("email")}
                className="text-sm"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {allowNameCapture && (
              <div className="space-y-2">
                <Input
                  placeholder="Your name (optional)"
                  {...form.register("name")}
                  className="text-sm"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3 mr-2" />
                  Join Waitlist
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Join {waitlistName}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          {allowNameCapture && (
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
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

        {customMessage && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{customMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
