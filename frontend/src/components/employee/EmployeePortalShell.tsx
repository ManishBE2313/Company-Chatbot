'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, ChevronRight, Clock3, FilePenLine, LogOut, MessageSquareQuote, UserRound } from 'lucide-react';
import { logoutUser } from '@/services/apiClient';
import { cn } from '@/utils/classNames';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
};

export function EmployeePortalShell({
  children,
  employeeId,
}: {
  children: React.ReactNode;
  employeeId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const navItems: NavItem[] = [
    {
      label: 'My Profile',
      href: employeeId ? `/employee/${employeeId}` : '/employee',
      icon: <UserRound size={16} />,
      match: (currentPath) => employeeId !== '' && currentPath === `/employee/${employeeId}`,
    },
    {
      label: 'Update Info',
      href: employeeId ? `/employeedetails/${employeeId}` : '/employeedetails',
      icon: <FilePenLine size={16} />,
      match: (currentPath) => employeeId !== '' && currentPath.startsWith(`/employeedetails/${employeeId}`),
    },
    {
      label: 'Timesheet',
      href: employeeId ? `/employee/${employeeId}/timesheet` : '/employee',
      icon: <Clock3 size={16} />,
      match: (currentPath) => employeeId !== '' && currentPath.startsWith(`/employee/${employeeId}/timesheet`),
    },
    {
      label: 'Survey',
      href: employeeId ? `/employee/${employeeId}/surveys` : '/employee',
      icon: <MessageSquareQuote size={16} />,
      match: (currentPath) => employeeId !== '' && currentPath.startsWith(`/employee/${employeeId}/surveys`),
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(252,99,107,0.08),_transparent_26%),linear-gradient(180deg,#fcfcfd_0%,#f7f8fb_100%)]">
      <aside className="sticky top-0 flex h-screen w-[272px] shrink-0 flex-col border-r border-slate-200 bg-[#171b2d] px-4 py-5 shadow-[10px_0_40px_rgba(15,23,42,0.12)]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fc636b_0%,#ff9b7a_100%)] text-teal-500 shadow-lg shadow-rose-900/20">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-teal-700">BlockExcel</p>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Employee Portal</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all',
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.20)]'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                      isActive ? 'bg-rose-50 text-[#fc636b]' : 'bg-white/8 text-slate-400 group-hover:text-slate-100'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.label}</span>
                  {isActive ? <ChevronRight size={14} className="ml-auto text-slate-400" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto -mx-4 border-t border-white/8 bg-[#141827] px-4 pb-1 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 text-slate-300">
              <LogOut size={16} />
            </span>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
