'use client';

import { Briefcase, CalendarDays, MapPin, ShieldAlert, Users } from 'lucide-react';
import { WorkInfo as WorkInfoType } from '@/types/employee';

interface WorkInfoProps {
  workInfo: WorkInfoType;
}

function formatDate(date?: string | null) {
  if (!date) return 'Not provided';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Not provided';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCompensation(amount?: number | null) {
  if (!amount) return 'Not provided';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function WorkInfo({ workInfo }: WorkInfoProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#fc636b]">Work</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">Role and employment details</h2>
        <p className="mt-1 text-sm text-slate-500">A structured overview of organizational placement, dates, compensation, and emergency contact coverage.</p>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Designation" value={workInfo.designation || 'Not provided'} />
        <StatCard icon={Users} label="Band" value={workInfo.band || 'Not provided'} />
        <StatCard icon={MapPin} label="Location" value={workInfo.location || 'Not provided'} />
        <StatCard icon={Users} label="Reporting manager" value={workInfo.reportingManager || 'Not provided'} />
      </div>

      <div className="grid gap-4 border-t border-slate-200 p-6 sm:grid-cols-2 sm:p-7">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-[#fc636b]" />
            Employment timeline
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Date of joining</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(workInfo.dateOfJoining)}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Annual compensation</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatCompensation(workInfo.annualCompensation)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#fff7f5_0%,#ffffff_55%,#fff2f3_100%)] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert className="h-4 w-4 text-[#fc636b]" />
            Emergency contact
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact person</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{workInfo.emergencyContact?.name || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Relationship</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{workInfo.emergencyContact?.relationship || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phone</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{workInfo.emergencyContact?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
