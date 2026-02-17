import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

/**
 * IMPORTANT:
 * Redis MUST be imported (IORedis).
 * Otherwise you get: "Redis is not defined"
 */
const connection = new IORedis({
 host: process.env.REDIS_HOST || "localhost",
 port: Number(process.env.REDIS_PORT || 6379),
 // BullMQ needs this setting to avoid auto-retry issues
 maxRetriesPerRequest: null,
});

// Worker listens to queue name: "jobs"
const worker = new Worker(
 "jobs",
 async (job) => {
  console.log("✅ Picked job:", job.id, job.name);
  console.log("📦 Job data:", job.data);

  // TODO: Here you will execute the real task (email/webhook/etc)
  console.log("🚀 Executed job:", job.id);

  // return value becomes job result
  return { ok: true };
 },
 { connection }
);

worker.on("completed", (job) => {
 console.log("🎉 Completed:", job.id);
});

worker.on("failed", (job, err) => {
 console.log("❌ Failed:", job?.id, err.message);
});

console.log("🟢 Worker running...");