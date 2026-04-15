'use client';

import { useParams } from 'next/navigation';
import { EmployeePortalShell } from '@/components/employee/EmployeePortalShell';

export default function EmployeeDetailsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const employeeId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  return <EmployeePortalShell employeeId={employeeId}>{children}</EmployeePortalShell>;
}
