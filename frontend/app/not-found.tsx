'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div
        className="bg-card border border-border rounded-2xl p-12 max-w-sm w-full text-center transition-all duration-400"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
              <path d="M10 10L18 18M18 10L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground" />
            </svg>
          </div>
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-foreground mb-2">404</h1>
        <p className="text-base font-semibold text-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/chat"
            className="block px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Go to chats
          </Link>
          <Link
            href="/login"
            className="block px-6 py-3 bg-transparent text-muted-foreground border border-border rounded-xl text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}