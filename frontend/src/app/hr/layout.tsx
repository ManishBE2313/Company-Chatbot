// src/app/hr/layout.tsx
// Shell layout for the entire /hr section.
// Renders the Asana-style left sidebar with nav links + role-gated items.
// All /hr/* pages render inside the {children} slot on the right.

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHRCurrentUser } from "@/hooks/useHRData";
import { logoutUser } from "@/services/apiClient";
import { cn } from "@/utils/classNames";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ShieldCheck,
  Power,
  ChevronRight,
} from "lucide-react";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";

// ─── Nav item definition ──────────────────────────────────────────────────────
// Each item optionally requires a minimum role to be visible.
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  // If set, only users with this role or higher see this item
  minRole?: "admin" | "superadmin";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/hr", icon: <LayoutDashboard size={16} /> },
  { label: "Jobs", href: "/hr/jobs", icon: <Briefcase size={16} /> },
  { label: "Applications", href: "/hr/applications", icon: <Users size={16} /> },
  // Superadmin-only section for full pipeline overview
  {
    label: "Admin Panel",
    href: "/hr/admin",
    icon: <ShieldCheck size={16} />,
    minRole: "superadmin",
  },
];

// Simple role hierarchy check
function hasAccess(userRole: string, minRole?: "admin" | "superadmin") {
  if (!minRole) return true;
  if (minRole === "admin") return userRole === "admin" || userRole === "superadmin";
  if (minRole === "superadmin") return userRole === "superadmin";
  return false;
}

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useHRCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">

      {/* ── Left Sidebar ── */}
      <aside className="w-56 shrink-0 bg-[#1e1f21] flex flex-col h-full">

        {/* Logo area */}
        <div className="h-14 flex items-center px-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-500 flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-[14px] font-semibold text-white tracking-tight">
              HR Pipeline
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">

          {/* Section label — matches Asana's "MY WORKSPACE" label style */}
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Recruitment
          </p>

          {NAV_ITEMS.filter((item) =>
            hasAccess(user?.role ?? "user", item.minRole)
          ).map((item) => {
            // Exact match for /hr, prefix match for sub-routes
            const isActive =
              item.href === "/hr"
                ? pathname === "/hr"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors group",
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <ChevronRight size={12} className="ml-auto text-slate-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="shrink-0 border-t border-white/5 px-3 py-3">
          {isLoading ? (
            <div className="flex items-center gap-2 px-2">
              <AsanaSpinner size="sm" className="text-slate-500" />
              <span className="text-[12px] text-slate-500">Loading...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {/* User info row */}
              <div className="flex items-center gap-2 px-2 py-1">
                {/* Initials avatar */}
                <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-slate-300 truncate">
                    {user?.email ?? "Unknown"}
                  </p>
                  {/* Role pill */}
                  <span className="text-[10px] text-indigo-400 font-medium capitalize">
                    {user?.role ?? "user"}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              >
                <Power size={13} />
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content area ── */}
      {/* Each page renders here — scrolls independently from sidebar */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}