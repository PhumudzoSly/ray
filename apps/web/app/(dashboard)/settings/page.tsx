import { Metadata } from "next";
import { getSession } from "@/actions/account/user";
import { checkLoopsSubscription } from "@/actions/account/loops-subscription";
import GeneralSettingsClient from "@/components/settings/general-settings-client";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const { email } = await getSession();
  
  // Check if user is subscribed to Loops
  const isSubscribed = await checkLoopsSubscription(email);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">General</h3>
          <p className="text-sm text-muted-foreground">
            Manage your general account settings.
          </p>
        </div>
        <GeneralSettingsClient 
          userEmail={email} 
          initialLoopsSubscription={isSubscribed}
        />
      </div>
    </div>
  );
}
