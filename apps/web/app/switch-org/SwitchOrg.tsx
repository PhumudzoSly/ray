"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import CreateOrg from "./CreateOrg";
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { organization } from "@/lib/authClient";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { getMyOrgs } from "@/actions/account/user";

const SwitchOrg = ({
  orgs,
}: {
  orgs: Awaited<ReturnType<typeof getMyOrgs>>;
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState((orgs && orgs[0]?.id) || "");
  const currentOrg = orgs?.find((org: any) => org.id === selectedOrg);

  const handleSwitchOrg = async () => {
    if (!selectedOrg) return;

    try {
      setLoading(true);
      // Use the client-side organization.setActive directly
      await organization.setActive({
        organizationId: selectedOrg,
      });

      toast.success("Organisation switched successfully");

      // Navigate after successful switch
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Error switching organisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg container px-5 py-10 flex flex-col justify-center items-center mx-auto">
      <CardHeader className="w-full">
        <CardTitle className="text-xl font-bold ">Organisations</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Create a new organisation or select an existing one to continue.
        </p>
      </CardHeader>
      <br />
      <Tabs className="w-full" defaultValue="select">
        <TabsList className="w-full" defaultValue={"select"}>
          <TabsTrigger className="w-full" value="select">
            Select organisation
          </TabsTrigger>
          <TabsTrigger className="w-full" value="create">
            Create organisation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateOrg />
        </TabsContent>
        <TabsContent value="select">
          <Card className="my-5">
            <CardHeader>
              <CardTitle>Organisations</CardTitle>
              <div className="py-5">
                <Select onValueChange={setSelectedOrg}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs?.map((org: any) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p>{currentOrg?.name || "No organisation selected"}</p>
                </div>
              </div>
              <br />
              <Button
                onClick={handleSwitchOrg}
                disabled={!currentOrg}
                loading={loading}
                className="w-full mt-3"
              >
                Proceed
              </Button>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SwitchOrg;
