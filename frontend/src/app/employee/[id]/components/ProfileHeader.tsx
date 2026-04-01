'use client';

import Image from 'next/image';
import { Building2, Mail, MapPin, Sparkles } from 'lucide-react';
import { Employee } from '@/types/employee';

interface ProfileHeaderProps {
  employee: Employee;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function ProfileHeader({ employee }: ProfileHeaderProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7f5_0%,#ffffff_52%,#fff0f2_100%)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative flex h-24 w-24 items-center justify-center  bg-[linear-gradient(135deg,#1f243d_0%,#fc636b_130%)] text-2xl font-semibold text-navy-500  shadow-rose-100">
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

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-[#c74452]">
                <Sparkles className="h-3.5 w-3.5" />
                Employee workspace
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="mt-2 text-base font-medium text-slate-600">{employee.workInfo.designation || 'Team member'}</p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  {employee.workInfo.band || 'Band not set'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {employee.workInfo.location || 'Location not set'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {employee.contactDetails.email || 'Work email unavailable'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
            <Metric label="Status" value={employee.profileCompleted ? 'Profile completed' : 'Profile pending'} />
            <Metric label="Manager" value={employee.workInfo.reportingManager || 'Not assigned'} />
            <Metric label="Emergency" value={employee.workInfo.emergencyContact?.name || 'Not provided'} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] px-6 py-5 sm:grid-cols-3 sm:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile overview</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            A cleaner snapshot of contact, identity, work, and education details for internal teams.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Primary email</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{employee.contactDetails.personalEmail || employee.contactDetails.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Joining date</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{employee.workInfo.dateOfJoining || 'Not available'}</p>
        </div>
      </div>
    </section>
  );
}
