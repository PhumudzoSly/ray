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
import { signInSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@workspace/ui/components/input";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { signIn } from "@/lib/authClient";
import { DEFAULT_LOGIN_REDIRECT } from "@/utils/config";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@workspace/ui/components/password-input";

const LoginForm = () => {
  //
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useSearchParams();
  const redirectURL = params.get("redirectUrl") || DEFAULT_LOGIN_REDIRECT;

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    startTransition(async () => {
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: redirectURL,
      });

      if (error) {
        toast.error(error.message);
      }
    });
  };

  return (
    <CardWrapper
      backButtonHref={`/auth/sign-up?redirectUrl=${redirectURL}`}
      backButtonLabel="Create Account Instead"
      headerLabel="Sign in to continue"
      showSocial
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      disabled={isPending}
                      {...field}
                      placeholder="*********"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Link
            href="/auth/reset-password"
            className={buttonVariants({
              variant: "link",
              className: "flex justify-end my-0",
            })}
          >
            Forgot password?
          </Link>

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? "Signing in...." : "Sign In"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
