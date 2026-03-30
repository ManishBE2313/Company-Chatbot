'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { WorkInfo as WorkInfoType } from '@/types/employee';
import { Briefcase, MapPin, DollarSign, Users, Badge } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WorkInfoProps {
  workInfo: WorkInfoType;
}

const statusColorMap: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  'on-leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  separated: 'bg-red-100 text-red-800 border-red-200',
};

const employmentTypeMap: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
};

export function WorkInfo({ workInfo }: WorkInfoProps) {
const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


  const formatCompensation = (amount?: number | null) => {
  if (!amount) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-orange-500" />
          Work Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Position & Band */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-500 mb-1">Designation</p>
              <p className="font-semibold text-lg text-gray-900">{workInfo.designation || "—"}</p>
              <p className="text-sm text-gray-600 mt-1">Band: {workInfo.band || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Employment Status</p>
              <Badge
           
                className={`w-fit ${statusColorMap[workInfo.employmentStatus || ""] || ""}`}
              >
             {workInfo.employmentStatus
  ? workInfo.employmentStatus.charAt(0).toUpperCase() +
    workInfo.employmentStatus.slice(1)
  : "—"}
              </Badge>
            </div>
          </div>

          {/* Location & Employment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-medium text-gray-900">  {workInfo.location || "—"}</p>
                <p className="text-sm text-gray-600">{workInfo.employmentCountry}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Employment Type</p>
              <Badge  className="w-fit">
                {employmentTypeMap[workInfo.employmentType] || workInfo.employmentType}
              </Badge>
            </div>
          </div>

          {/* Dates & Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date of Joining</p>
              <p className="font-medium text-gray-900">{formatDate(workInfo.dateOfJoining)}</p>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Annual Compensation</p>
                <p className="font-semibold text-gray-900">
                  {formatCompensation(workInfo.annualCompensation)}
                </p>
              </div>
            </div>
          </div>

          {/* Manager & Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Reporting Manager</p>
                <p className="font-medium text-gray-900">{workInfo.reportingManager}</p>
              </div>
            </div>
            <div className="border-l-2 border-l-gray-200 pl-4">
              <p className="text-sm text-gray-500 mb-2">Emergency Contact</p>
             <p className="font-medium text-gray-900">
  {workInfo.emergencyContact?.name || "—"}
</p>
<p className="text-sm text-gray-600">
  {workInfo.emergencyContact?.relationship || "—"}
</p>
<p className="text-sm text-gray-600">
  {workInfo.emergencyContact?.phone || "—"}
</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
