"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createOrg } from "@/actions/account/user";
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

const formSchema = z.object({
  name: z.string().min(1, "Organisation name is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateOrgProps {
  orgSwitch?: boolean;
}

function CreateOrg({ orgSwitch }: CreateOrgProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function handleSubmit(values: FormData) {
    setIsLoading(true);
    try {
      await createOrg({ name: values.name });
      toast.success("Organisation created successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create organisation");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organisation name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter organisation name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Organisation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default CreateOrg;
