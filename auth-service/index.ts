import app from "./app";
import { sequelize } from "./config/database";
import { runtimeConfig } from "./config/runtime";
import { startAuthRequestWorker } from "./workers/authRequestWorker";

async function initServer() {
  await sequelize.authenticate();

  if (runtimeConfig.dbAutoSync) {
    await sequelize.sync({ alter: runtimeConfig.nodeEnv !== "production" });
  }

  startAuthRequestWorker();

  return app.listen(runtimeConfig.port, () => {
    console.log(`Auth service running at http://localhost:${runtimeConfig.port}`);
  });
}

void initServer();