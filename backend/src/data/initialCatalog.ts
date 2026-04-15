import { AssignableRoleName } from "../constants/system";

export interface SeedDepartment {
  name: string;
  costCenterCode: string;
}

export interface SeedLocation {
  name: string;
  country: string;
  city: string;
}

export interface SeedSkill {
  name: string;
  category: string;
}

export interface SeedJobRole {
  title: string;
  jobFamily: string;
  level: string;
  defaultExperienceMin: number;
  defaultExperienceMax: number;
  description: string;
  mustHave: string[];
  niceToHave: string[];
}

export const seedDepartments: SeedDepartment[] = [
  { name: "Engineering", costCenterCode: "ENG-001" },
  { name: "Product", costCenterCode: "PRD-001" },
  { name: "Design", costCenterCode: "DSN-001" },
  { name: "Data", costCenterCode: "DAT-001" },
  { name: "People", costCenterCode: "HR-001" },
  { name: "Finance", costCenterCode: "FIN-001" },
  { name: "Operations", costCenterCode: "OPS-001" },
  { name: "Sales", costCenterCode: "SAL-001" },
];

export const seedLocations: SeedLocation[] = [
  { name: "New York, USA", country: "USA", city: "New York" },
  { name: "San Francisco, USA", country: "USA", city: "San Francisco" },
  { name: "Seattle, USA", country: "USA", city: "Seattle" },
  { name: "Austin, USA", country: "USA", city: "Austin" },
  { name: "Boston, USA", country: "USA", city: "Boston" },
  { name: "Chicago, USA", country: "USA", city: "Chicago" },
  { name: "Los Angeles, USA", country: "USA", city: "Los Angeles" },
  { name: "Atlanta, USA", country: "USA", city: "Atlanta" },
  { name: "Denver, USA", country: "USA", city: "Denver" },
  { name: "Miami, USA", country: "USA", city: "Miami" },
  { name: "Toronto, Canada", country: "Canada", city: "Toronto" },
  { name: "Vancouver, Canada", country: "Canada", city: "Vancouver" },
  { name: "Montreal, Canada", country: "Canada", city: "Montreal" },
  { name: "Calgary, Canada", country: "Canada", city: "Calgary" },
  { name: "Ottawa, Canada", country: "Canada", city: "Ottawa" },
  { name: "Edmonton, Canada", country: "Canada", city: "Edmonton" },
  { name: "Bengaluru, India", country: "India", city: "Bengaluru" },
  { name: "Hyderabad, India", country: "India", city: "Hyderabad" },
  { name: "Pune, India", country: "India", city: "Pune" },
  { name: "Mumbai, India", country: "India", city: "Mumbai" },
  { name: "Delhi, India", country: "India", city: "Delhi" },
  { name: "Chennai, India", country: "India", city: "Chennai" },
];

export const seedRoleNames: AssignableRoleName[] = [
  "superadmin",
  "admin",
  "interviewer",
  "hm",
  "hrbp",
  "finance",
  "executive",
  "rmg",
  "employee",
];

export const seedSkills: SeedSkill[] = [
  { name: "JavaScript", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Python", category: "backend" },
  { name: "FastAPI", category: "backend" },
  { name: "SQL", category: "data" },
  { name: "PostgreSQL", category: "data" },
  { name: "MySQL", category: "data" },
  { name: "Redis", category: "cloud" },
  { name: "Docker", category: "cloud" },
  { name: "Kubernetes", category: "cloud" },
  { name: "AWS", category: "cloud" },
  { name: "CI/CD", category: "cloud" },
  { name: "System Design", category: "architecture" },
  { name: "REST APIs", category: "backend" },
  { name: "GraphQL", category: "backend" },
  { name: "Data Analysis", category: "analytics" },
  { name: "Tableau", category: "analytics" },
  { name: "Power BI", category: "analytics" },
  { name: "Product Strategy", category: "product" },
  { name: "Roadmapping", category: "product" },
  { name: "Stakeholder Management", category: "product" },
  { name: "Figma", category: "design" },
  { name: "User Research", category: "design" },
  { name: "Testing", category: "quality" },
  { name: "Selenium", category: "quality" },
  { name: "Machine Learning", category: "data" },
  { name: "Communication", category: "soft-skill" },
  { name: "Leadership", category: "soft-skill" },
];

export const seedJobRoles: SeedJobRole[] = [
  {
    title: "Backend Engineer",
    jobFamily: "Engineering",
    level: "Mid",
    defaultExperienceMin: 3,
    defaultExperienceMax: 6,
    description: "Builds APIs, services, and distributed systems powering internal and customer experiences.",
    mustHave: ["Node.js", "Express", "SQL", "REST APIs"],
    niceToHave: ["Redis", "Docker", "System Design", "AWS"],
  },
  {
    title: "Full Stack Engineer",
    jobFamily: "Engineering",
    level: "Senior",
    defaultExperienceMin: 5,
    defaultExperienceMax: 8,
    description: "Owns frontend and backend delivery for product teams with strong cross-stack execution.",
    mustHave: ["JavaScript", "TypeScript", "React", "Node.js"],
    niceToHave: ["Next.js", "SQL", "Docker", "CI/CD"],
  },
  {
    title: "Frontend Engineer",
    jobFamily: "Engineering",
    level: "Mid",
    defaultExperienceMin: 3,
    defaultExperienceMax: 6,
    description: "Builds scalable, accessible user interfaces and collaborates closely with design and product.",
    mustHave: ["JavaScript", "TypeScript", "React", "Next.js"],
    niceToHave: ["Testing", "Figma", "Communication"],
  },
  {
    title: "Product Manager",
    jobFamily: "Product",
    level: "Senior",
    defaultExperienceMin: 5,
    defaultExperienceMax: 9,
    description: "Owns product discovery, prioritization, execution, and stakeholder alignment.",
    mustHave: ["Product Strategy", "Roadmapping", "Stakeholder Management", "Communication"],
    niceToHave: ["Data Analysis", "Leadership", "User Research"],
  },
  {
    title: "Data Analyst",
    jobFamily: "Data",
    level: "Mid",
    defaultExperienceMin: 2,
    defaultExperienceMax: 5,
    description: "Turns operational and product data into insights, dashboards, and decision support.",
    mustHave: ["SQL", "Data Analysis", "Tableau"],
    niceToHave: ["Power BI", "Python", "Communication"],
  },
  {
    title: "DevOps Engineer",
    jobFamily: "Engineering",
    level: "Senior",
    defaultExperienceMin: 4,
    defaultExperienceMax: 8,
    description: "Improves release automation, cloud infrastructure, security posture, and platform reliability.",
    mustHave: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    niceToHave: ["Python", "System Design", "Leadership"],
  },
  {
    title: "QA Engineer",
    jobFamily: "Engineering",
    level: "Mid",
    defaultExperienceMin: 2,
    defaultExperienceMax: 5,
    description: "Designs and runs quality strategies across manual and automated testing workflows.",
    mustHave: ["Testing", "Selenium", "Communication"],
    niceToHave: ["JavaScript", "CI/CD", "Leadership"],
  },
];
