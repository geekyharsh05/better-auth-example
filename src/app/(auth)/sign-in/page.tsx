"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/general/loading-button";
import { signInSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorContext } from "better-auth/react";
import { GithubIcon } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const [pendingCredentials, setPendingCredentials] = useState(false);
  const [pendingGithub, setPendingGithub] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleCredentialsSignIn = async (
    values: z.infer<typeof signInSchema>
  ) => {
    setPendingCredentials(true);

    toast.promise(
      authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => setPendingCredentials(true),
          onSuccess: async () => {
            router.push("/");
            router.refresh();
          },
          onError: (ctx: ErrorContext) => {
            console.error(ctx);
            throw new Error(ctx.error.message ?? "Something went wrong.");
          },
        }
      ),
      {
        loading: "Signing you in...",
        success: "Successfully signed in!",
        error: (err) => err.message ?? "Sign-in failed. Please try again.",
      }
    );

    setPendingCredentials(false);
  };

  const handleSignInWithGithub = async () => {
    setPendingGithub(true);

    toast.promise(
      authClient.signIn.social(
        {
          provider: "github",
        },
        {
          onRequest: () => setPendingGithub(true),
          onSuccess: async () => {
            router.push("/");
            router.refresh();
          },
          onError: (ctx: ErrorContext) => {
            console.error(ctx);
            throw new Error(ctx.error.message ?? "Something went wrong.");
          },
        }
      ),
      {
        loading: "Signing in with GitHub...",
        success: "Successfully signed in with GitHub!",
        error: (err) =>
          err.message ?? "GitHub sign-in failed. Please try again.",
      }
    );

    setPendingGithub(false);
  };

  return (
    <div className="grow flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCredentialsSignIn)}
              className="space-y-6"
            >
              {["email", "password"].map((field) => (
                <FormField
                  control={form.control}
                  key={field}
                  name={field as keyof z.infer<typeof signInSchema>}
                  render={({ field: fieldProps }) => (
                    <FormItem>
                      <FormLabel>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={field === "password" ? "password" : "email"}
                          placeholder={`Enter your ${field}`}
                          {...fieldProps}
                          autoComplete={
                            field === "password" ? "current-password" : "email"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <LoadingButton pending={pendingCredentials}>
                Sign in
              </LoadingButton>
            </form>
          </Form>
          <div className="mt-4">
            <LoadingButton
              pending={pendingGithub}
              onClick={handleSignInWithGithub}
            >
              <GithubIcon className="w-4 h-4 mr-2" />
              Continue with GitHub
            </LoadingButton>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
