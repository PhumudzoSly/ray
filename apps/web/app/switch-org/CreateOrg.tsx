"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { createOrg } from "@/actions/account/user";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, "Invalid organisation name"),
});

export type NewOrg = z.infer<typeof formSchema>;

export default function CreateOrg({ orgSwitch }: { orgSwitch?: boolean }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const form = useForm<NewOrg>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  /**
   * Handles the form submission when creating a new organisation.
   * @param {NewOrg} values - The form values containing the organisation name.
   * @returns {Promise<void>}
   */
  async function handleSubmit(values: NewOrg): Promise<void> {
    setLoading(true);
    try {
      await createOrg({ name: values.name });
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create organisation");
      setLoading(false);
    }
  }

  return (
    <div className="py-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organisation name</FormLabel>
                <FormControl>
                  <Input placeholder="Organisation name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Organisation"}
            </Button>
            {orgSwitch && (
              <Button variant="outline" asChild>
                <Link href="/switch-org">Switch Organisation</Link>
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
