"use client";
import React, { useTransition } from "react";
import CardWrapper from "./card-wrapper";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { z } from "zod";
import { emailSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { forgetPassword } from "@/lib/authClient";
import { useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/utils/config";

const ResetPasswordForm = () => {
  //
  const [isPending, startTransition] = useTransition();
  const params = useSearchParams();
  const redirectURL = params.get("redirectUrl") || DEFAULT_LOGIN_REDIRECT;

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    startTransition(async () => {
      const { error } = await forgetPassword({
        email: values.email,
        redirectTo: `/auth/new-password?redirectUrl=${redirectURL}`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email for password reset link");
      }
    });
  };

  return (
    <CardWrapper
      backButtonHref={`/auth/sign-in?redirectUrl=${redirectURL}`}
      backButtonLabel="Sign in instead"
      headerLabel="Reset Password"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="johndoe@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? "Sending email..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetPasswordForm;
