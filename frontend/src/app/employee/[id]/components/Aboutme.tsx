'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { AboutMe as AboutMeType } from '@/types/employee';
import { Badge, User } from 'lucide-react';

interface AboutMeProps {
  aboutMe: AboutMeType;
}

const maritalStatusMap: Record<string, string> = {
  single: 'Single',
  married: 'Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
};

export function AboutMe({ aboutMe }: AboutMeProps) {
  const formatDateOfBirth = (dob: string) => {
    try {
      return new Date(dob).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dob;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-500" />
          About Me
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Nationality" value={aboutMe.nationality} />
          <InfoField
            label="Date of Birth"
            value={formatDateOfBirth(aboutMe.dateOfBirth)}
          />
          <InfoField
            label="Blood Group"
            value={
              <Badge className="w-fit">
                {aboutMe.bloodGroup}
              </Badge>
            }
          />
          <InfoField
            label="Marital Status"
            value={maritalStatusMap[aboutMe.maritalStatus] || aboutMe.maritalStatus}
          />

          {aboutMe.aadhar && (
            <InfoField label="Aadhar Number" value={maskSensitiveData(aboutMe.aadhar)} />
          )}
          {aboutMe.pan && (
            <InfoField label="PAN" value={maskSensitiveData(aboutMe.pan)} />
          )}
          {aboutMe.uan && (
            <InfoField label="UAN Number" value={maskSensitiveData(aboutMe.uan)} />
          )}
          {aboutMe.passportNumber && (
            <InfoField
              label="Passport Number"
              value={maskSensitiveData(aboutMe.passportNumber)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      {typeof value === 'string' ? (
        <p className="font-medium text-gray-900">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

function maskSensitiveData(value: string): string {
  if (value.length <= 4) return value;
  const masked = '*'.repeat(Math.max(1, value.length - 4));
  return masked + value.slice(-4);
}
