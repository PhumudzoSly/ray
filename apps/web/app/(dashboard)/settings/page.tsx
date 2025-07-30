import { getSession } from "@/actions/account/user";
import PageHeader from "@/components/shared/page-header";
import { DeveloperInsights } from "@/components/developer/developer-insights";

export default async function SettingsPage() {
  const { userId } = await getSession();

  return (
    <div className="space-y-6">
      <PageHeader title="General Settings" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Settings Overview</h3>
          <p className="text-sm text-muted-foreground">
            Manage your user settings and features
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {/* <MailSubscribe />
        <NotificationSettings userId={userId} /> */}
        <DeveloperInsights userId={userId} />
      </div>
    </div>
  );
}
