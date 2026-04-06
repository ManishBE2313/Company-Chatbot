import app from "./app";
import { sequelize } from "./config/database";
import { runtimeConfig } from "./config/runtime";
import { seedInitialData } from "./scripts/seedInitialData";
import { startAutoMatcher } from "./workers/autoMatcher";

export async function initServer() {
  await sequelize.authenticate();
  await sequelize.sync({ force: false, alter: true });
  await seedInitialData();

  console.log(`[1/5] Backend port connected to ${runtimeConfig.backendPort}`);
  console.log(`[2/5] Database connected to mysql://${runtimeConfig.dbHost}:${runtimeConfig.dbPort}/${runtimeConfig.dbName}`);
  console.log(`[3/5] Database migration synced on startup`);
  console.log(`[4/5] Frontend expected on ${runtimeConfig.frontendUrl}`);
  console.log(`[5/5] FastAPI expected on ${runtimeConfig.fastApiBaseUrl}`);
  console.log(`Qdrant expected on ${runtimeConfig.qdrantUrl}`);

  startAutoMatcher();

  return app.listen(runtimeConfig.backendPort, () => {
    console.log(`Backend server running at http://localhost:${runtimeConfig.backendPort}`);
  });
}

void initServer();
