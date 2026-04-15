'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Building2, CalendarRange, HeartHandshake, Mail, MapPin, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { Employee } from '@/types/employee';

interface ProfileHeaderProps {
  employee: Employee;
}

function formatDate(value?: string) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-[190px] items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success';
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${tone === 'success' ? 'text-emerald-700' : 'text-slate-950'}`}>{value}</p>
    </div>
  );
}

export function ProfileHeader({ employee }: ProfileHeaderProps) {
  const initials = `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase() || 'EM';
  const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
  const profileStatus = employee.profileCompleted ? 'Ready for internal workflows' : 'Profile details need attention';

  return (
    <section className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="relative border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(255,144,104,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(79,70,229,0.12),_transparent_24%),linear-gradient(180deg,#fffdfa_0%,#fff7f4_45%,#ffffff_100%)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.12),transparent)]" />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#1a2238_0%,#f46a5f_120%)] text-2xl font-semibold tracking-[0.12em] text-white shadow-[0_20px_50px_rgba(244,106,95,0.28)]">
              {employee.profileImage ? (
                <Image
                  src={employee.profileImage}
                  alt={employee.firstName}
                  fill
                  sizes="96px"
                  className="rounded-[28px] object-cover"
                />
              ) : (
                initials
              )}
            </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bb4d43] shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Employee profile
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[40px]">
                  {fullName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{employee.workInfo.designation || 'Team member'}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span>{employee.workInfo.employmentType || 'full-time'}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span>{employee.workInfo.employmentStatus || 'active'}</span>
                </div>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
                  A unified snapshot of role, reporting line, workplace, and profile readiness designed for quick internal review.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <InfoChip icon={<Building2 className="h-4 w-4" />} label="Band" value={employee.workInfo.band || 'Band not set'} />
              <InfoChip icon={<MapPin className="h-4 w-4" />} label="Location" value={employee.workInfo.location || 'Location not set'} />
              <InfoChip icon={<Mail className="h-4 w-4" />} label="Work email" value={employee.contactDetails.email || 'Work email unavailable'} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <Metric
              label="Profile status"
              value={profileStatus}
              tone={employee.profileCompleted ? 'success' : 'default'}
            />
            <Metric label="Reporting manager" value={employee.workInfo.reportingManager || 'Not assigned'} />
            <Metric label="Emergency contact" value={employee.workInfo.emergencyContact?.name || 'Not provided'} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] px-6 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile overview</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Structured identity and work details presented in a clean internal workspace layout.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <UserRound className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Primary email</p>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{employee.contactDetails.personalEmail || employee.contactDetails.email}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarRange className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Joining date</p>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{formatDate(employee.workInfo.dateOfJoining)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <HeartHandshake className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Emergency contact</p>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            {employee.workInfo.emergencyContact?.phone || employee.workInfo.emergencyContact?.name || 'Not available'}
          </p>
        </div>
      </div>
    </section>
  );
}
