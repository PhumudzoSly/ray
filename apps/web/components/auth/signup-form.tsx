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
import { signUpSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { signUp } from "@/lib/authClient";
import { toast } from "sonner";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { DEFAULT_LOGIN_REDIRECT } from "@/utils/config";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
  //
  const [isPending, startTransition] = useTransition();
  const params = useSearchParams();
  const redirectURL = params.get("redirectUrl") || DEFAULT_LOGIN_REDIRECT;

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    startTransition(async () => {
      const { data, error } = await signUp.email({
        name: `${values.firstName} ${values.lastName}`,
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
      backButtonHref={`/auth/sign-in?redirectUrl=${redirectURL}`}
      backButtonLabel="Already have an account?"
      headerLabel="Welcome to RayAI"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="John"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? "Signing up...." : "Create Account"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default SignUpForm;
