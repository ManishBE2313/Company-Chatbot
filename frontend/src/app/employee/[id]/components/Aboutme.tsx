'use client';

import { HeartPulse, IdCard, ShieldCheck } from 'lucide-react';
import { AboutMe as AboutMeType } from '@/types/employee';

interface AboutMeProps {
  aboutMe: AboutMeType;
}

const maritalStatusMap: Record<string, string> = {
  single: 'Single',
  married: 'Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
};

function maskSensitiveData(value: string): string {
  if (value.length <= 4) return value;
  const masked = '*'.repeat(Math.max(1, value.length - 4));
  return masked + value.slice(-4);
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || 'Not provided'}</p>
    </div>
  );
}

export function AboutMe({ aboutMe }: AboutMeProps) {
  const dateOfBirth = aboutMe.dateOfBirth
    ? new Date(aboutMe.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not provided';

  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#fc636b]">Personal</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Identity and compliance</h2>
            <p className="mt-1 text-sm text-slate-500">Verified details used for HR records, benefits, and internal administration.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Protected profile fields
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
        <InfoBlock label="Nationality" value={aboutMe.nationality} />
        <InfoBlock label="Date of birth" value={dateOfBirth} />
        <InfoBlock label="Blood group" value={aboutMe.bloodGroup} />
        <InfoBlock label="Marital status" value={maritalStatusMap[aboutMe.maritalStatus] || aboutMe.maritalStatus} />
      </div>

      <div className="grid gap-4 border-t border-slate-200 p-6 sm:grid-cols-2 sm:p-7">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <IdCard className="h-4 w-4 text-[#fc636b]" />
            Government identifiers
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Aadhar" value={aboutMe.aadhar ? maskSensitiveData(aboutMe.aadhar) : 'Not provided'} />
            <InfoBlock label="PAN" value={aboutMe.pan ? maskSensitiveData(aboutMe.pan) : 'Not provided'} />
            <InfoBlock label="UAN" value={aboutMe.uan ? maskSensitiveData(aboutMe.uan) : 'Not provided'} />
            <InfoBlock label="Passport" value={aboutMe.passportNumber ? maskSensitiveData(aboutMe.passportNumber) : 'Not provided'} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#fff7f5_0%,#ffffff_55%,#fff2f3_100%)] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HeartPulse className="h-4 w-4 text-[#fc636b]" />
            Personal summary
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <span className="font-semibold text-slate-900">Profile owner:</span> {aboutMe.nationality || 'Employee'}
            </p>
            <p className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <span className="font-semibold text-slate-900">Civil status:</span>{' '}
              {maritalStatusMap[aboutMe.maritalStatus] || aboutMe.maritalStatus || 'Not provided'}
            </p>
            <p className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <span className="font-semibold text-slate-900">Health detail:</span> Blood group {aboutMe.bloodGroup || 'not shared'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
