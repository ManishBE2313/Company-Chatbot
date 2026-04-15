'use client';

import { Mail, MapPin, Phone, UserCircle2 } from 'lucide-react';
import { ContactDetails as ContactDetailsType } from '@/types/employee';

interface ContactDetailsProps {
  contactDetails: ContactDetailsType;
  onUpdate?: (details: ContactDetailsType) => void;
}

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}

export function ContactDetails({ contactDetails }: ContactDetailsProps) {
  const fullAddress = [contactDetails.address, contactDetails.city, contactDetails.state, contactDetails.zipCode, contactDetails.country]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#fc636b]">Contact</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Communication details</h2>
            <p className="mt-1 text-sm text-slate-500">Essential contact information for collaboration and employee records.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <UserCircle2 className="h-3.5 w-3.5" />
            Primary profile info
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7">
        <DetailTile icon={Mail} label="Work email" value={contactDetails.email} />
        <DetailTile icon={Mail} label="Personal email" value={contactDetails.personalEmail || 'Not provided'} />
        <DetailTile icon={Phone} label="Phone" value={contactDetails.phone} />
        <DetailTile icon={MapPin} label="City" value={contactDetails.city} />
        <div className="sm:col-span-2">
          <DetailTile icon={MapPin} label="Address" value={fullAddress || 'Not provided'} />
        </div>
      </div>
    </section>
  );
}
