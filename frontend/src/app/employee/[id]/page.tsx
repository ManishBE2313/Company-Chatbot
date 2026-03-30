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

export default function EmployeePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapEmployeeData = (data: any) => {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation,
      band: data.band,
      location: data.location,
      workEmail: data.workEmail,
      profileCompleted: data.profileCompleted,

      contactDetails: data.employeeContact || {},
      aboutMe: data.employeePersonal || {},

      workInfo: data.employeeWork
        ? {
            ...data.employeeWork,
            designation: data.designation,
            band: data.band,
            location: data.location,
            emergencyContact: data.employeeEmergency || {},
          }
        : {
            designation: data.designation,
            band: data.band,
            location: data.location,
            employmentStatus: '',
            employmentType: '',
            dateOfJoining: null,
            annualCompensation: null,
            reportingManager: '',
            emergencyContact: {},
          },

      educationInfo: data.employeeEducations || [],
    };
  };

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeDetails();

        if (res) {
          const mapped = mapEmployeeData(res);
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
  }, [employee, router]);

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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader employee={employee} />
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <EducationInfo education={employee.educationInfo} />

          <ContactDetails
            contactDetails={employee.contactDetails}
            onUpdate={handleContactUpdate}
          />

          <AboutMe aboutMe={employee.aboutMe} />

          <WorkInfo workInfo={employee.workInfo} />
        </div>
      </div>
    </main>
  );
}