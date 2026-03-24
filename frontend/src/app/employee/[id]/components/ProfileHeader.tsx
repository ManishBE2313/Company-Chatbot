'use client';

import { Card } from '@/components/ui/Card';
import { Employee } from '@/types/employee';

interface ProfileHeaderProps {
  employee: Employee;
}

export function ProfileHeader({ employee }: ProfileHeaderProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

  return (
    <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">

          {/* Avatar Replacement */}
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
            {employee.profileImage ? (
              <img
                src={employee.profileImage}
                alt={employee.firstName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>

            <p className="text-lg text-gray-600 mt-1">
              {employee.workInfo.designation}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="font-medium">Band:</span> {employee.workInfo.band}
              </span>

              <span className="flex items-center gap-1">
                <span className="font-medium">Location:</span> {employee.workInfo.location}
              </span>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
}