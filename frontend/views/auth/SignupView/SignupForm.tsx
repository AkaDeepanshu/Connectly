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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useCheckUsername, useSignup } from "./useSignup";
import { Spinner } from "@/components/ui/spinner";

type SignupFormValues = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<SignupFormValues>({
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const username = form.watch("username");
  const debouncedUsername = useDebounce(username, 500);

  const { data, isFetching, isError } = useCheckUsername(debouncedUsername);
  const isUsernameAvailable = data?.data.available;
  const isFormBlocked =
  isUsernameAvailable === false || isFetching;


  const onSubmit = (data: SignupFormValues) => {
    mutate({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Join Connectly and start chatting
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              const showStatus = debouncedUsername.length >= 3;

              return (
                <FormItem>
                  <FormLabel>Username</FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="yourusername"
                        required
                        {...field}
                        className="pr-10"
                      />

                      {showStatus && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isFetching ? (
                            <Spinner className="h-4 w-4 text-muted-foreground" />
                          ) : isUsernameAvailable ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>

                  {showStatus && !isFetching && isUsernameAvailable === false && (
                    <p className="text-xs text-red-500">
                      Username is already taken
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
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
                      type={showPassword ? "text" : "password"}
                      required
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
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

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Button */}
          <Button type="submit" className="w-full" disabled={isPending || isFormBlocked}>
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Creating account
              </span>
            ) : (
              "Create account"
            )}
          </Button>

        </form>
      </Form>

      {/* Footer */}
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium cursor-pointer hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
