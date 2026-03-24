import app from "./app";
import { sequelize } from "./config/database";
import { runtimeConfig } from "./config/runtime";
import { startAutoMatcher } from "./workers/autoMatcher";

export async function initServer() {
  await sequelize.authenticate();
  await sequelize.sync({ force: false, alter: false });

  console.log(`[1/5] Backend port connected to ${runtimeConfig.backendPort}`);
  console.log(`[2/5] Database connected to postgres://${runtimeConfig.dbHost}:${runtimeConfig.dbPort}/${runtimeConfig.dbName}`);
  console.log(`[3/5] Database migration synced on startup`);
  console.log(`[4/5] Frontend expected on ${runtimeConfig.frontendUrl}`);
  console.log(`[5/5] FastAPI expected on ${runtimeConfig.fastApiBaseUrl}`);
  console.log(`Qdrant expected on ${runtimeConfig.qdrantUrl}`);

  startAutoMatcher();

  return app.listen(runtimeConfig.backendPort, () => {
    console.log(`Backend server running at http://localhost:${runtimeConfig.backendPort}`);
  });
}

void initServer().catch((error) => {
  console.error("Backend startup failed:", error);
  process.exit(1);
});
