"use client";

import * as React from "react";
import { useState, useEffect, useId } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Button } from "@workspace/ui/components/button";
import { MoonIcon, SunIcon, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GeneralSettingsClientProps {
  userEmail: string;
  initialLoopsSubscription?: boolean;
}

export default function GeneralSettingsClient({ userEmail, initialLoopsSubscription = false }: GeneralSettingsClientProps) {
  const id = useId();
  const themeId = useId();
  const { setTheme, theme } = useTheme();
  
  const [loopsSubscribed, setLoopsSubscribed] = useState(initialLoopsSubscription);
  const [isUpdatingLoops, setIsUpdatingLoops] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLoopsToggle = async (checked: boolean) => {
    setIsUpdatingLoops(true);
    
    try {
      const { subscribeToLoops, unsubscribeFromLoops } = await import("@/actions/account/loops-subscription");
      
      const result = checked 
        ? await subscribeToLoops(userEmail)
        : await unsubscribeFromLoops(userEmail);
      
      if (result.success) {
        setLoopsSubscribed(checked);
        toast.success(
          checked 
            ? "Successfully subscribed to email notifications" 
            : "Successfully unsubscribed from email notifications"
        );
      } else {
        toast.error(result.error || "Failed to update subscription. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to update subscription. Please try again.");
    } finally {
      setIsUpdatingLoops(false);
    }
  };

  // Add keyboard shortcut (Ctrl/Cmd + K) for theme toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        handleThemeToggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [theme]);

  return (
    <div className="space-y-6">
      {/* Email Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage your email subscription preferences for product updates and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={id} className="text-sm font-medium">
                Loops Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive product updates and important notifications via email ({userEmail})
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isUpdatingLoops && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                id={id}
                checked={loopsSubscribed}
                onCheckedChange={handleLoopsToggle}
                disabled={isUpdatingLoops}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the appearance of the application. Use Ctrl/Cmd + K to quickly toggle themes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={themeId} className="text-sm font-medium">
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
              <Switch
                id={themeId}
                checked={theme === "light"}
                onCheckedChange={handleThemeToggle}
                className="peer data-[state=checked]:bg-input data-[state=unchecked]:bg-input absolute inset-0 h-[inherit] w-auto [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
              />
              <span className="peer-data-[state=checked]:text-muted-foreground/70 pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center">
                <MoonIcon size={16} aria-hidden="true" />
              </span>
              <span className="peer-data-[state=unchecked]:text-muted-foreground/70 pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center">
                <SunIcon size={16} aria-hidden="true" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}