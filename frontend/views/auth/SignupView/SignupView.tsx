"use client";

import Image from "next/image";
import SignupForm from "./SignupForm";

export default function SignupView() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* Left Image Section */}
      <div className="hidden md:flex items-center justify-center bg-muted">
        <Image
          src="/images/signup.png"
          alt="Signup illustration"
          width={420}
          height={420}
          className="object-contain"
          priority
        />
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
