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
import { passwordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { client } from "@/lib/authClient";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { DEFAULT_LOGIN_REDIRECT } from "@/utils/config";

const NewPasswordForm = () => {
  //
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const params = useSearchParams();
  const redirectURL = params.get("redirectUrl") || DEFAULT_LOGIN_REDIRECT;
  const token = params.get("token") || "";

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    startTransition(async () => {
      const { error } = await client.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        toast.error("Failed to reset your password, please get a new link");
      } else {
        toast.success("Sign in with your new password");
        router.push(`/auth/sign-in?redirectUrl=${redirectURL}`);
      }
    });
  };

  return (
    <CardWrapper
      backButtonHref={`/auth/sign-in?redirectUrl=${redirectURL}`}
      backButtonLabel="Sign in instead"
      headerLabel="New Password"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="*******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="*******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default NewPasswordForm;
