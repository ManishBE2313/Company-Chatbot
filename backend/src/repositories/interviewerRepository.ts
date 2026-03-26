import { User } from "../config/database";

export async function getAllActiveInterviewers() {
  return await User.findAll({
    where: {
      role: "interviewer",
      isActive: true,
    },
    attributes: ["id", "email"],
  });
}