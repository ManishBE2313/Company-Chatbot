'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Loader } from 'lucide-react';
import { Employee } from '@/types/employee';
import { ProfileHeader } from './components/ProfileHeader';
import { EducationInfo } from './components/EducationInfo';
import { ContactDetails } from './components/ContactDetails';
import { AboutMe } from './components/Aboutme';
import { WorkInfo } from './components/WorkInfo';
import { getEmployeeDetails } from '@/services/apiClient';

type EmployeeApiResponse = {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  band?: string;
  location?: string;
  workEmail?: string;
  profileCompleted: boolean;
  employeeContact?: {
    personalEmail?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  employeePersonal?: {
    nationality?: string;
    dob?: string;
    bloodGroup?: string;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    aadhar?: string;
    pan?: string;
    uan?: string;
    passport?: string;
  };
  employeeWork?: {
    reportingManager?: string;
    dateOfJoining?: string;
    annualCompensation?: number;
  };
  employeeEmergency?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  employeeEducations?: Array<{
    id: string;
    type?: string;
    institute?: string;
    year?: string;
  }>;
};

export default function EmployeePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapEmployeeData = (data: EmployeeApiResponse): Employee => {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      profileCompleted: data.profileCompleted,

      contactDetails: {
        email: data.workEmail || '',
        personalEmail: data.employeeContact?.personalEmail || '',
        phone: data.employeeContact?.phone || '',
        address: data.employeeContact?.address || '',
        city: data.employeeContact?.city || '',
        state: '',
        country: '',
        zipCode: '',
      },

      aboutMe: {
        nationality: data.employeePersonal?.nationality || '',
        aadhar: data.employeePersonal?.aadhar || '',
        pan: data.employeePersonal?.pan || '',
        uan: data.employeePersonal?.uan || '',
        passportNumber: data.employeePersonal?.passport || '',
        dateOfBirth: data.employeePersonal?.dob || '',
        bloodGroup: data.employeePersonal?.bloodGroup || '',
        maritalStatus: data.employeePersonal?.maritalStatus || 'single',
      },

      workInfo: data.employeeWork
        ? {
            designation: data.designation || '',
            band: data.band || '',
            location: data.location || '',
            employmentStatus: 'active',
            employmentType: 'full-time',
            employmentCountry: '',
            dateOfJoining: data.employeeWork.dateOfJoining || '',
            annualCompensation: data.employeeWork.annualCompensation || 0,
            reportingManager: data.employeeWork.reportingManager || '',
            emergencyContact: {
              name: data.employeeEmergency?.name || '',
              relationship: data.employeeEmergency?.relation || '',
              phone: data.employeeEmergency?.phone || '',
            },
          }
        : {
            designation: data.designation || '',
            band: data.band || '',
            location: data.location || '',
            employmentStatus: 'active',
            employmentType: 'full-time',
            employmentCountry: '',
            dateOfJoining: '',
            annualCompensation: 0,
            reportingManager: '',
            emergencyContact: {
              name: '',
              relationship: '',
              phone: '',
            },
          },

      educationInfo: (data.employeeEducations || []).map((edu) => ({
        id: edu.id,
        institution: edu.institute || '',
        degree: edu.type || '',
        field: '',
        graduationYear: Number(edu.year) || 0,
      })),
    };
  };

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeDetails();

        if (res) {
          const mapped = mapEmployeeData(res as EmployeeApiResponse);
          setEmployee(mapped);
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        setError('Failed to load employee data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);


   const userId = employee?.id;
  //  Redirect if profile not completed
  useEffect(() => {
    if (employee && !employee.profileCompleted) {
      router.push(`/employeedetails/${userId}`);
    }
  }, [employee, router, userId]);

  const handleContactUpdate = async () => {
    console.log('handlecontactupdate');
  };

  // Optional: prevent flicker
  if (employee && !employee.profileCompleted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error || 'Employee not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <ProfileHeader employee={employee} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            <EducationInfo education={employee.educationInfo} />
            <WorkInfo workInfo={employee.workInfo} />
          </div>

          <div className="space-y-6">
            <ContactDetails
              contactDetails={employee.contactDetails}
              onUpdate={handleContactUpdate}
            />
            <AboutMe aboutMe={employee.aboutMe} />
          </div>
        </div>
      </div>
    </main>
  );
}
