'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { Loader } from 'lucide-react';
import { Employee } from '@/types/employee';
import { ProfileHeader } from './components/ProfileHeader';
import { EducationInfo } from './components/EducationInfo';
import { ContactDetails } from './components/ContactDetails';
import { AboutMe } from './components/Aboutme';
import { WorkInfo } from './components/WorkInfo';

const dummyEmployees: Record<string, any> = {
  'emp-003': {
    id: 'emp-003',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    educationInfo: [
      {
        id: 'edu-4',
        institution: 'Indian Institute of Technology Delhi',
        degree: 'Bachelor of Technology',
        field: 'Electronics and Communication',
        graduationYear: 2017,
      },
      {
        id: 'edu-5',
        institution: 'University of Pennsylvania',
        degree: 'Master of Science',
        field: 'Data Science',
        graduationYear: 2019,
      },
    ],
    contactDetails: {
      email: 'rajesh.kumar@company.com',
      phone: '+91 98765 43210',
      personalEmail: 'rajesh.kumar.dev@gmail.com',
      address: '789 Innovation Park',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560001',
    },
    aboutMe: {
      nationality: 'India',
      aadhar: '4567 8901 2345',
      pan: 'PQRST9876H',
      uan: '100456789012',
      passportNumber: 'N45678901',
      dateOfBirth: '1995-12-10',
      bloodGroup: 'A+',
      maritalStatus: 'married',
    },
    workInfo: {
      band: 'Senior',
      designation: 'Senior Data Scientist',
      location: 'Bangalore',
      employmentType: 'full-time',
      employmentCountry: 'India',
      employmentStatus: 'active',
      dateOfJoining: '2019-07-10',
      annualCompensation: 2400000,
      reportingManager: 'Priya Sharma',
      emergencyContact: {
        name: 'Priya Kumar',
        relationship: 'Spouse',
        phone: '+91 98765 54321',
      },
    },
  },

  'emp-004': {
    id: 'emp-004',
    firstName: 'Sarah',
    lastName: 'Williams',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    educationInfo: [
      {
        id: 'edu-6',
        institution: 'Harvard Business School',
        degree: 'Master of Business Administration',
        field: 'Business Management',
        graduationYear: 2015,
      },
      {
        id: 'edu-7',
        institution: 'Yale University',
        degree: 'Bachelor of Arts',
        field: 'Economics',
        graduationYear: 2013,
      },
    ],
    contactDetails: {
      email: 'sarah.williams@company.com',
      phone: '+1 (555) 456-7890',
      personalEmail: 'sarah.w@personal.com',
      address: '321 Executive Plaza',
      city: 'New York',
      state: 'New York',
      country: 'United States',
      zipCode: '10001',
    },
    aboutMe: {
      nationality: 'United States',
      aadhar: '5678 9012 3456',
      pan: 'LMNOP1234I',
      uan: '100789012345',
      passportNumber: 'P23456789',
      dateOfBirth: '1991-03-25',
      bloodGroup: 'AB+',
      maritalStatus: 'married',
    },
    workInfo: {
      band: 'Lead',
      designation: 'Director, Product Strategy',
      location: 'New York',
      employmentType: 'full-time',
      employmentCountry: 'United States',
      employmentStatus: 'active',
      dateOfJoining: '2018-01-15',
      annualCompensation: 320000,
      reportingManager: 'David Martinez',
      emergencyContact: {
        name: 'James Williams',
        relationship: 'Husband',
        phone: '+1 (555) 567-8901',
      },
    },
  },
};

export default function EmployeePage() {
  const params = useParams();
  const id = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        // const data = await getEmployeeDetails;
      const data = dummyEmployees[id];
        if (data) {
          setEmployee(data);
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

//   const handleContactUpdate = async (updatedDetails: ContactDetailsType) => {
//     try {
//       const updated = await updateEmployeeContactDetails(id, updatedDetails);
//       if (updated) {
//         setEmployee(updated);
//       }
//     } catch (err) {
//       console.error('Failed to update contact details:', err);
//       throw err;
//     }
//   };
  const handleContactUpdate = async () => {
 console.log("handlecontactupdate")
  };

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
          {/* Educational Information */}
          <EducationInfo education={employee.educationInfo} />

          {/* Contact Details */}
          <ContactDetails
            contactDetails={employee.contactDetails}
            onUpdate={handleContactUpdate}
          />

          {/* About Me */}
          <AboutMe aboutMe={employee.aboutMe} />

          {/* Work Information */}
          <WorkInfo workInfo={employee.workInfo} />
        </div>
      </div>
    </main>
  );
}
