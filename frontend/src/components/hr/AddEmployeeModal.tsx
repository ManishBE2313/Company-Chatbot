'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import ROOT_API_URL from '@/services/config';

/* ================= TYPES ================= */

type Education = {
  type: string;
  institute: string;
  year: string;
  percentage: string;
};

type FormType = {
  firstName: string;
  lastName: string;
  designation: string;
  band: string;
  location: string;
  workEmail: string;

  contact: {
    personalEmail: string;
    phone: string;
    city: string;
    address: string;
  };

  personal: {
    nationality: string;
    dob: string;
    bloodGroup: string;
    maritalStatus: string;
    aadhar: string;
    pan: string;
    uan: string;
    passport: string;
  };

  work: {
    reportingManager: string;
    dateOfJoining: string;
    annualCompensation: string;
  };

  emergency: {
    name: string;
    relation: string;
    phone: string;
  };

  education: Education[];
};

const STEPS = [
  { title: 'Basic Info', description: 'Employee basic information' },
  { title: 'Contact', description: 'Contact details' },
  { title: 'Personal', description: 'Personal information' },
  { title: 'Work', description: 'Work information' },
  { title: 'Emergency', description: 'Emergency contact' },
  { title: 'Education', description: 'Educational background' }
];

export default function AddEmployeeModal({ 
  onClose, 
  mode = "HR", 
  employee 
}: any){
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<FormType>({
    firstName: '',
    lastName: '',
    designation: '',
    band: '',
    location: '',
    workEmail: '',

    contact: {
      personalEmail: '',
      phone: '',
      city: '',
      address: ''
    },

    personal: {
      nationality: '',
      dob: '',
      bloodGroup: '',
      maritalStatus: '',
      aadhar: '',
      pan: '',
      uan: '',
      passport: ''
    },

    work: {
      reportingManager: '',
      dateOfJoining: '',
      annualCompensation: ''
    },

    emergency: {
      name: '',
      relation: '',
      phone: ''
    },

    education: [
      { type: '', institute: '', year: '', percentage: '' }
    ]
  });

  /* ================= HANDLERS ================= */

  const handleBasicChange = (field: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (
    section: keyof FormType,
    field: string,
    value: string
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  type EducationField = keyof Education;

  const handleEducationChange = (
    index: number,
    field: EducationField,
    value: string
  ) => {
    const updated = [...form.education];
    updated[index][field] = value;
    setForm({ ...form, education: updated });
  };

  const addEducation = () => {
    setForm({
      ...form,
      education: [
        ...form.education,
        { type: '', institute: '', year: '', percentage: '' }
      ]
    });
  };

useEffect(() => {
  if (mode === "EMPLOYEE") {
    setStep(2);
  }
}, [mode]);


const submit = async () => {
  try {
    setIsLoading(true);

    let payload: any = { ...form };

    // Quick Add (Step 1)
    if (step === 1) {
      payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        workEmail: form.workEmail,
        designation: form.designation,
        band: form.band || null,
        location: form.location || null,
      };
    } else {
      // Clean full payload (important)
      const cleanPayload = (obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key] === "" || obj[key] === "Invalid date") {
            obj[key] = null;
          }
          if (typeof obj[key] === "object" && obj[key] !== null) {
            cleanPayload(obj[key]);
          }
        });
        return obj;
      };

      payload = cleanPayload(payload);
    }

   if (mode === "HR") {
  await axios.post(`${ROOT_API_URL}/api/employee/create`, payload);
} else {
  await axios.put(`${ROOT_API_URL}/api/employee/update`, payload);
}
   

    alert("Employee Added");
    onClose();
  } catch (err) {
    console.error(err);
    alert("Error");
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  if (employee && mode === "EMPLOYEE") {
    setForm((prev: any) => ({
      ...prev,

      contact: {
        ...prev.contact,
        ...employee.contactDetails,
      },

      personal: {
        ...prev.personal,
        ...employee.aboutMe,
      },

      work: {
        ...prev.work,
        ...employee.workInfo,
      },

      emergency: {
        ...prev.emergency,
        ...employee.workInfo?.emergencyContact,
      },

      education: employee.educationInfo?.length
        ? employee.educationInfo
        : prev.education,
    }));
  }
}, [employee, mode]);

  const progressValue = (step / STEPS.length) * 100;

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#032e64] px-8 py-6 text-white relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Add Employee</h1>
              <p className="text-blue-100">Complete all sections to onboard a new employee</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Step {step} of {STEPS.length}</span>
              <span className="text-sm text-blue-100">{STEPS[step - 1].title}</span>
            </div>
            <div className="h-2 bg-blue-500/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-8 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* STEP 1: BASIC */}
       {step === 1 && mode === "HR" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600 mb-6">Enter the employee's basic details</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    id="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => handleBasicChange('firstName', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    id="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => handleBasicChange('lastName', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="workEmail" className="text-sm font-medium text-gray-700">Work Email *</label>
                <input
                  id="workEmail"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={form.workEmail}
                  onChange={(e) => handleBasicChange('workEmail', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium text-gray-700">Designation *</label>
                  <input
                    id="designation"
                    placeholder="Software Engineer"
                    value={form.designation}
                    onChange={(e) => handleBasicChange('designation', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="band" className="text-sm font-medium text-gray-700">Band *</label>
                  <input
                    id="band"
                    placeholder="Level 3"
                    value={form.band}
                    onChange={(e) => handleBasicChange('band', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</label>
                <input
                  id="location"
                  placeholder="San Francisco"
                  value={form.location}
                  onChange={(e) => handleBasicChange('location', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-600 mb-6">Enter contact details</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="personalEmail" className="text-sm font-medium text-gray-700">Personal Email</label>
                <input
                  id="personalEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={form.contact.personalEmail}
                  onChange={(e) => handleChange('contact', 'personalEmail', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={form.contact.phone}
                  onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
                <input
                  id="city"
                  placeholder="San Francisco"
                  value={form.contact.city}
                  onChange={(e) => handleChange('contact', 'city', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                <input
                  id="address"
                  placeholder="123 Main Street, Suite 100"
                  value={form.contact.address}
                  onChange={(e) => handleChange('contact', 'address', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PERSONAL */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-600 mb-6">Enter personal details</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="dob" className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={form.personal.dob}
                  onChange={(e) => handleChange('personal', 'dob', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</label>
                <input
                  id="nationality"
                  placeholder="Indian"
                  value={form.personal.nationality}
                  onChange={(e) => handleChange('personal', 'nationality', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="bloodGroup" className="text-sm font-medium text-gray-700">Blood Group</label>
                  <input
                    id="bloodGroup"
                    placeholder="O+"
                    value={form.personal.bloodGroup}
                    onChange={(e) => handleChange('personal', 'bloodGroup', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Marital Status</label>
                  <input
                    id="maritalStatus"
                    placeholder="Single"
                    value={form.personal.maritalStatus}
                    onChange={(e) => handleChange('personal', 'maritalStatus', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="aadhar" className="text-sm font-medium text-gray-700">Aadhar Number</label>
                <input
                  id="aadhar"
                  placeholder="1234 5678 9012"
                  value={form.personal.aadhar}
                  onChange={(e) => handleChange('personal', 'aadhar', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="pan" className="text-sm font-medium text-gray-700">PAN</label>
                  <input
                    id="pan"
                    placeholder="ABCDE1234F"
                    value={form.personal.pan}
                    onChange={(e) => handleChange('personal', 'pan', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="uan" className="text-sm font-medium text-gray-700">UAN</label>
                  <input
                    id="uan"
                    placeholder="123456789012"
                    value={form.personal.uan}
                    onChange={(e) => handleChange('personal', 'uan', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="passport" className="text-sm font-medium text-gray-700">Passport</label>
                  <input
                    id="passport"
                    placeholder="A12345678"
                    value={form.personal.passport}
                    onChange={(e) => handleChange('personal', 'passport', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: WORK */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Work Information</h2>
                <p className="text-sm text-gray-600 mb-6">Enter work-related details</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="reportingManager" className="text-sm font-medium text-gray-700">Reporting Manager</label>
                <input
                  id="reportingManager"
                  placeholder="Jane Smith"
                  value={form.work.reportingManager}
                  onChange={(e) => handleChange('work', 'reportingManager', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateOfJoining" className="text-sm font-medium text-gray-700">Date of Joining</label>
                <input
                  id="dateOfJoining"
                  type="date"
                  value={form.work.dateOfJoining}
                  onChange={(e) => handleChange('work', 'dateOfJoining', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="annualCompensation" className="text-sm font-medium text-gray-700">Annual Compensation</label>
                <input
                  id="annualCompensation"
                  placeholder="$120,000"
                  value={form.work.annualCompensation}
                  onChange={(e) => handleChange('work', 'annualCompensation', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 5: EMERGENCY */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Emergency Contact</h2>
                <p className="text-sm text-gray-600 mb-6">Enter emergency contact information</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="emergencyName" className="text-sm font-medium text-gray-700">Name</label>
                <input
                  id="emergencyName"
                  placeholder="Jane Doe"
                  value={form.emergency.name}
                  onChange={(e) => handleChange('emergency', 'name', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="emergencyRelation" className="text-sm font-medium text-gray-700">Relation</label>
                <input
                  id="emergencyRelation"
                  placeholder="Spouse"
                  value={form.emergency.relation}
                  onChange={(e) => handleChange('emergency', 'relation', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  id="emergencyPhone"
                  placeholder="+1 (555) 000-0000"
                  value={form.emergency.phone}
                  onChange={(e) => handleChange('emergency', 'phone', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 6: EDUCATION */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Educational Background</h2>
                <p className="text-sm text-gray-600 mb-6">Enter education details</p>
              </div>
              <div className="space-y-6">
                {form.education.map((edu, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Education {i + 1}</h3>
                      {i > 0 && (
                        <button
                          onClick={() => {
                            const updated = form.education.filter((_, idx) => idx !== i);
                            setForm({ ...form, education: updated });
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor={`type-${i}`} className="text-sm font-medium text-gray-700">Type</label>
                        <input
                          id={`type-${i}`}
                          placeholder="10th/12th/Grad"
                          value={edu.type}
                          onChange={(e) => handleEducationChange(i, 'type', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`institute-${i}`} className="text-sm font-medium text-gray-700">Institute</label>
                        <input
                          id={`institute-${i}`}
                          placeholder="University Name"
                          value={edu.institute}
                          onChange={(e) => handleEducationChange(i, 'institute', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`year-${i}`} className="text-sm font-medium text-gray-700">Year</label>
                        <input
                          id={`year-${i}`}
                          placeholder="2020"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(i, 'year', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`percentage-${i}`} className="text-sm font-medium text-gray-700">Percentage</label>
                        <input
                          id={`percentage-${i}`}
                          placeholder="85%"
                          value={edu.percentage}
                          onChange={(e) => handleEducationChange(i, 'percentage', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="w-full h-10 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                + Add More Education
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex justify-between gap-3">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="h-10 px-4 flex items-center gap-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <div className="flex gap-3">
           {step === 1 && (
  <button
    onClick={submit}
    disabled={isLoading}
    className="h-10 px-6 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70 transition-colors font-medium"
  >
    {isLoading ? "Submitting..." : "Quick Add"}
  </button>
)}
{step < STEPS.length && (
  <button
    onClick={() => setStep(step + 1)}
    className="h-10 px-6 flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
  >
    Next
    <ChevronRight size={18} />
  </button>
)}
            {step === STEPS.length && (
              <button
                onClick={submit}
                disabled={isLoading}
                className="h-10 px-6 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Submitting...' : (
                  <>
                    <Check size={18} />
                  {mode === "HR" ? "Submit" : "Complete Profile"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
