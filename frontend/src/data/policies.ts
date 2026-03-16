// src/data/policies.ts

export interface Policy {
  id: string;
  title: string;
  content: string; 
}

export const policiesData: Policy[] = [
  // ... (Keep your existing Anti Harassment, Attendance, and Code of Conduct text here) ...
  {
    id: "anti-harassment",
    title: "Anti Harassment",
    content: `[Anti Harassment content...]` // Keep your actual long text here
  },
  {
    id: "attendance",
    title: "Attendance",
    content: `[Attendance content...]` // Keep your actual long text here
  },
  {
    id: "business-conduct",
    title: "Business Conduct",
    content: `[Business Conduct policy content will go here...]`
  },
  {
    id: "byod",
    title: "BYOD",
    content: `[BYOD policy content will go here...]`
  },
  {
    id: "code-of-conduct",
    title: "Code of Conduct",
    content: `[Code of conduct content...]` // Keep your actual long text here
  },
  {
    id: "company-property",
    title: "Company Property",
    content: `[Company Property policy content will go here...]`
  },
  {
    id: "data-security",
    title: "Data Security",
    content: `[Data Security policy content will go here...]`
  },
  {
    id: "disciplinary-action",
    title: "Disciplinary Action",
    content: `[Disciplinary Action policy content will go here...]`
  },
  {
    id: "equality",
    title: "Equality",
    content: `[Equality policy content will go here...]`
  },
  {
    id: "fraternization",
    title: "Fraternization",
    content: `[Fraternization policy content will go here...]`
  },
  // --- NEW POLICIES ADDED BELOW ---
  {
    id: "flexible-work",
    title: "Flexible Work",
    content: `[Flexible Work policy content will go here...]`
  },
  {
    id: "grievance",
    title: "Grievance",
    content: `[Grievance policy content will go here...]`
  },
  {
    id: "health-and-safety",
    title: "Health and Safety",
    content: `[Health and Safety policy content will go here...]`
  },
  {
    id: "laptop-security",
    title: "Laptop Security",
    content: `[Laptop Security policy content will go here...]`
  },
  {
    id: "remote-work",
    title: "Remote Work",
    content: `[Remote Work policy content will go here...]`
  },
  {
    id: "substance-abuse",
    title: "Substance Abuse",
    content: `[Substance Abuse policy content will go here...]`
  },
  {
    id: "vacation",
    title: "vacation",
    content: `[vacation policy content will go here...]`
  }
];