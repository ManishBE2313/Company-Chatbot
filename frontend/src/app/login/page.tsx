// src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Custom Microsoft SVG Icon for a polished look
const MicrosoftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    const BACKEND_AUTH_BASE_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3000";
    window.location.href = BACKEND_AUTH_BASE_URL + "/api/auth/sso/login";
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:rounded-3xl">
        <div className="bg-indigo-600 px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
            <Bot size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Enterprise AI
          </h1>
          <p className="mt-2 text-indigo-100">
            Sign in to access the secure corporate knowledge base.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <Button
            variant="outline"
            size="lg"
            className="relative flex w-full items-center justify-center gap-3 border-slate-300 text-slate-700 hover:bg-slate-50 h-12 text-[15px]"
            onClick={handleMicrosoftLogin}
            isLoading={isLoading}
          >
            {!isLoading && <MicrosoftIcon />}
            Continue with Microsoft
          </Button>

          <div className="mt-8 text-center text-xs text-slate-400">
            By logging in, you agree to our corporate IT security policies.
            Access is restricted to authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
}
