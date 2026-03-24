'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { EducationInfo as EducationInfoType } from '@/types/employee';
import { Badge, BookOpen } from 'lucide-react';

interface EducationInfoProps {
  education: EducationInfoType[];
}

export function EducationInfo({ education }: EducationInfoProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Educational Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {education.length > 0 ? (
            education.map((edu) => (
              <div key={edu.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {edu.degree}
                    </h3>
                    <p className="text-gray-600 mt-1">{edu.field}</p>
                    <p className="text-sm text-gray-500 mt-2">{edu.institution}</p>
                  </div>
                  <Badge className="ml-4 shrink-0">
                    {edu.graduationYear}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No education information available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
