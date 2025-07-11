import { Separator } from "@workspace/ui/components/separator";
import { SidebarNav } from "./sidebar-nav";

const sidebarNavItems = [
  {
    title: "General",
    href: "/settings",
  },
  {
    title: "Account & Security",
    href: "/settings/account",
  },
  {
    title: "Team",
    href: "/settings/organization",
  },
  {
    title: "API Keys",
    href: "/settings/api-keys",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container space-y-6  pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and app settings.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col w-full space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="lg:w-1/5 w-full h-full">
          <SidebarNav className=" w-full" items={sidebarNavItems} />
        </div>
        <div className="flex-1 lg:max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
