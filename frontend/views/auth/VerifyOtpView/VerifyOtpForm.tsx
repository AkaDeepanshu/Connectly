"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { useVerifyOtp } from "./useVerifyOtp";
import { useAuthStore } from "@/stores/auth.store";

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState("");
  const { mutate, isPending, isError, error } = useVerifyOtp();
  const pendingVerificationEmail = useAuthStore((state) => state.pendingVerificationEmail);

  const onSubmit = () => {
    if (!pendingVerificationEmail) {
      console.error("No email found for verification");
      return;
    }

    mutate({
      email: pendingVerificationEmail,
      otp: otp,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Heading */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Verify OTP</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          pattern={REGEXP_ONLY_DIGITS}
        >
          <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Verify Button */}
      <Button
        className="w-full"
        disabled={otp.length !== 6 || isPending}
        onClick={onSubmit}
      >
        {isPending ? "Verifying..." : "Verify OTP"}
      </Button>

      {isError && (
        <p className="text-sm text-red-500 text-center">
          {(error as Error).message}
        </p>
      )}

      {/* Resend */}
      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <span className="text-primary cursor-pointer hover:underline">
          Resend OTP
        </span>
      </p>
    </div>
  );
}
