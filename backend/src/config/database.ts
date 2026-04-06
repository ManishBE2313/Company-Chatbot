import { Sequelize } from "sequelize";
import OrganizationModel from "../../models/organization";
import DepartmentModel from "../../models/department";
import LocationModel from "../../models/location";
import AccessRoleModel from "../../models/accessRole";
import EmployeeRoleModel from "../../models/employeeRole";
import SkillModel from "../../models/skill";
import JobRoleModel from "../../models/jobRole";
import JobRoleSkillModel from "../../models/jobRoleSkill";
import InterviewPanelModel from "../../models/interviewPanel";
import InterviewPanelMemberModel from "../../models/interviewPanelMember";
import CandidateModel from "../../models/candidate";
import JobApplicationModel from "../../models/jobApplication";
import JobCriteriaModel from "../../models/jobCriteria";
import JobModel from "../../models/job";
import UserModel from "../../models/user";
import InterviewSlotModel from "../../models/interviewSlot";
import InterviewModel from "../../models/interview";
import ScorecardModel from "../../models/scorecard";
import PipelineEventModel from "../../models/pipelineEvent";
import { runtimeConfig } from "./runtime";
import EmployeeContactModel from "../../models/employeeContact";
import EmployeePersonalModel from "../../models/employeePersonal";
import EmployeeWorkModel from "../../models/employeeWork";
import EmployeeEmergencyModel from "../../models/employeeEmergency";
import EmployeeEducationModel from "../../models/employeeEducation";
import TimesheetModel from "../../models/timesheet";
import TimesheetEntryModel from "../../models/timesheetEntry";

const isProduction = runtimeConfig.nodeEnv.toLowerCase() === "production";

export const sequelize = new Sequelize(
  runtimeConfig.dbName,
  runtimeConfig.dbUser,
  runtimeConfig.dbPassword,
  {
    host: runtimeConfig.dbHost,
    port: runtimeConfig.dbPort,
    dialect: "mysql",
    logging: runtimeConfig.dbLogging ? console.log : false,
    dialectOptions: isProduction && runtimeConfig.dbSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
  }
);

export const Organization = OrganizationModel(sequelize);
export const Department = DepartmentModel(sequelize);
export const Location = LocationModel(sequelize);
export const AccessRole = AccessRoleModel(sequelize);
export const EmployeeRole = EmployeeRoleModel(sequelize);
export const Skill = SkillModel(sequelize);
export const JobRole = JobRoleModel(sequelize);
export const JobRoleSkill = JobRoleSkillModel(sequelize);
export const InterviewPanel = InterviewPanelModel(sequelize);
export const InterviewPanelMember = InterviewPanelMemberModel(sequelize);
export const Candidate = CandidateModel(sequelize);
export const Job = JobModel(sequelize);
export const JobCriteria = JobCriteriaModel(sequelize);
export const JobApplication = JobApplicationModel(sequelize);
export const User = UserModel(sequelize);
export const Employee = User;
export const InterviewSlot = InterviewSlotModel(sequelize);
export const Interview = InterviewModel(sequelize);
export const Scorecard = ScorecardModel(sequelize);
export const PipelineEvent = PipelineEventModel(sequelize);
export const EmployeeContact = EmployeeContactModel(sequelize);
export const EmployeePersonal = EmployeePersonalModel(sequelize);
export const EmployeeWork = EmployeeWorkModel(sequelize);
export const EmployeeEmergency = EmployeeEmergencyModel(sequelize);
export const EmployeeEducation = EmployeeEducationModel(sequelize);
export const Timesheet = TimesheetModel(sequelize);
export const TimesheetEntry = TimesheetEntryModel(sequelize);
const models = {
  organization: Organization,
  department: Department,
  location: Location,
  accessRole: AccessRole,
  employeeRole: EmployeeRole,
  skill: Skill,
  jobRole: JobRole,
  jobRoleSkill: JobRoleSkill,
  interviewPanel: InterviewPanel,
  interviewPanelMember: InterviewPanelMember,
  candidate: Candidate,
  job: Job,
  jobCriteria: JobCriteria,
  jobApplication: JobApplication,
  user: User,
  employee: Employee,
  interviewSlot: InterviewSlot,
  interview: Interview,
  scorecard: Scorecard,
  pipelineEvent: PipelineEvent,
  employeeContact: EmployeeContact,
  employeePersonal: EmployeePersonal,
  employeeWork: EmployeeWork,
  employeeEmergency: EmployeeEmergency,
  employeeEducation: EmployeeEducation,
  timesheet: Timesheet,
  timesheetEntry: TimesheetEntry,
};
for (const model of new Set(Object.values(models) as Array<any>)) {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
}

export const getTransaction = () => sequelize.transaction();

export type MainDbModelName = keyof typeof models;

export function getMainDbModel<T extends MainDbModelName>(modelName: T) {
  return models[modelName];
}
