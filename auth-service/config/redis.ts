import { Queue } from "bullmq";
import IORedis from "ioredis";
import { runtimeConfig } from "./runtime";

function createRedisClient() {
  return new IORedis({
    host: runtimeConfig.redisHost,
    port: runtimeConfig.redisPort,
    password: runtimeConfig.redisPassword,
    db: runtimeConfig.redisDb,
    maxRetriesPerRequest: null,
  });
}

export const redisConnection = createRedisClient();
export const authRequestQueue = new Queue(runtimeConfig.authRequestQueueName, {
  connection: redisConnection,
});

export function createBullConnection() {
  return createRedisClient();
}