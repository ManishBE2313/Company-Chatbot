'use client';

import { BookOpen, GraduationCap } from 'lucide-react';
import { EducationInfo as EducationInfoType } from '@/types/employee';

interface EducationInfoProps {
  education: EducationInfoType[];
}

export function EducationInfo({ education }: EducationInfoProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-[#fc636b]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#fc636b]">Education</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Academic background</h2>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {education.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <BookOpen className="h-3.5 w-3.5" />
                      Education record
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{edu.degree || 'Course not provided'}</h3>
                    <p className="mt-1 text-sm text-slate-500">{edu.field || 'Academic specialization not provided'}</p>
                    <p className="mt-4 text-sm font-medium text-slate-700">{edu.institution || 'Institute not provided'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                    {edu.graduationYear || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            No education information available yet.
          </div>
        )}
      </div>
    </section>
  );
}
