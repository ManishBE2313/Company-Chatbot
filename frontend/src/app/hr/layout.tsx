"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHRCurrentUser } from "@/hooks/useHRData";
import { logoutUser } from "@/services/apiClient";
import { cn } from "@/utils/classNames";
import {
  Briefcase,
  CalendarRange,
  ChevronRight,
  LayoutDashboard,
  Power,
  ShieldCheck,
  Users,
  Settings, 
  ClipboardCheck,
} from "lucide-react";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  minRole?: "admin" | "superadmin";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/hr", icon: <LayoutDashboard size={16} /> },
  { label: "My Interviews", href: "/hr/my-interviews", icon: <CalendarRange size={16} /> },
  { label: "Jobs", href: "/hr/jobs", icon: <Briefcase size={16} /> },
  { label: "Applications", href: "/hr/applications", icon: <Users size={16} /> },
  {
    label: "Timesheets",
    href: "/hr/timesheets",
    icon: <ClipboardCheck size={16} />,
    minRole: "admin",
  },
  {
    label: "Company Settings", // <-- New Tab
    href: "/hr/settings",
    icon: <Settings size={16} />,
    minRole: "admin", // Assuming HR/Admins are the ones reviewing jobs and assigning roles
  },
  {
    label: "Admin Panel",
    href: "/hr/admin",
    icon: <ShieldCheck size={16} />,
    minRole: "admin",
  },
];

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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <aside className="flex h-full w-56 shrink-0 flex-col bg-[#1e1f21]">
        <div className="flex h-14 items-center border-b border-white/5 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-white">HR Pipeline</span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Recruitment
          </p>

          {NAV_ITEMS.filter((item) => hasAccess(user?.role ?? "user", item.minRole)).map((item) => {
            const isActive = item.href === "/hr" ? pathname === "/hr" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors",
                  isActive
                    ? "bg-white/10 font-medium text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>{item.icon}</span>
                {item.label}
                {isActive && <ChevronRight size={12} className="ml-auto text-slate-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/5 px-3 py-3">
          {isLoading ? (
            <div className="flex items-center gap-2 px-2">
              <AsanaSpinner size="sm" className="text-slate-500" />
              <span className="text-[12px] text-slate-500">Loading...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400 shrink-0">
                  {user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-slate-300">{user?.email ?? "Unknown"}</p>
                  <span className="text-[10px] font-medium capitalize text-indigo-400">{user?.role ?? "user"}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
              >
                <Power size={13} />
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
