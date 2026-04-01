"use client";

import React from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  text?: string;
  mainText: string;
  link?: string;
  linkText?: string;
  type?: "success" | "error" | "warning" | "normal";
  clickText?: string;
  handleClick?: () => void;
}

export const showToast = ({
  text,
  mainText,
  link,
  linkText,
  type = "normal",
  clickText,
  handleClick,
}: ToastProps) => {
  toast.custom(
    (t: { visible: any; id: any; }) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } pointer-events-auto flex w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all`}
      >
        {/* Dynamic Color Bar on the left */}
        <div
          className={`w-1.5 shrink-0 ${
            type === "success"
              ? "bg-emerald-500"
              : type === "error"
              ? "bg-red-500"
              : type === "warning"
              ? "bg-amber-500"
              : "bg-indigo-500"
          }`}
        />

        <div className="flex w-full items-start p-4">
          <div className="shrink-0 pt-0.5">
            {type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            {type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
            {type === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
            {type === "normal" && <Info className="h-5 w-5 text-indigo-500" />}
          </div>
          
          <div className="ml-3 flex-1">
            <p className="text-[14px] font-semibold text-slate-800">{mainText}</p>
            {text && <p className="mt-1 text-[13px] text-slate-500">{text}</p>}

            {/* Action Links */}
            {(linkText || clickText) && (
              <div className="mt-3 flex gap-4 text-[13px] font-medium">
                {linkText && link && (
                  <Link href={link} className="text-indigo-600 hover:text-indigo-700 transition-colors">
                    {linkText}
                  </Link>
                )}
                {clickText && handleClick && (
                  <button onClick={handleClick} className="text-indigo-600 hover:text-indigo-700 transition-colors">
                    {clickText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex shrink-0 p-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    ),
    { position: "bottom-left", duration: 5000 }
  );
};