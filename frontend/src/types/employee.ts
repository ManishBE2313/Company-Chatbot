export interface EducationInfo {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}

export interface ContactDetails {
  email: string;
  phone: string;
  personalEmail?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface AboutMe {
  nationality: string;
  aadhar?: string;
  pan?: string;
  uan?: string;
  passportNumber?: string;
  dateOfBirth: string;
  bloodGroup: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface WorkInfo {
  band: string;
  designation: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  employmentCountry: string;
  employmentStatus: 'active' | 'inactive' | 'on-leave' | 'separated';
  dateOfJoining: string;
  annualCompensation: number;
  reportingManager: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  educationInfo: EducationInfo[];
  contactDetails: ContactDetails;
  aboutMe: AboutMe;
  workInfo: WorkInfo;
  profileCompleted: boolean;
}
