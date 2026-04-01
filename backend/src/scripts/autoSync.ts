import { sequelize } from "../config/database";
import { seedInitialData } from "./seedInitialData";

async function autoSyncDatabase() {
  try {
    console.log("Connecting to the database...");
    await sequelize.authenticate();
    console.log("Connection established successfully.");

    console.log("Starting Auto-Sync...");
    await sequelize.sync({ force: false, alter: true });
    await seedInitialData();

    console.log("Database synchronized successfully! All new models and changes applied.");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }
}

void autoSyncDatabase();
