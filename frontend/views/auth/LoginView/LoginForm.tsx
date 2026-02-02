"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useLogin } from "./useLogin";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { mutate, isPending, isError, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log(data);
    mutate({
      identifier: data.email,
      password: data.password,
    });

  };

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Login to continue to Connectly
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="text"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev)=>!prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Button */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>

      {isError && (
        <p className="text-sm text-red-500 text-center">
          {(error as any)?.response?.data?.message || "Login failed"}
        </p>
      )}

      {/* Footer */}
      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium cursor-pointer hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
