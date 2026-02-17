import { pool } from "../../api/src/db";
import Redis from "ioredis";
import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis({
 host: "localhost",
 port: 6379,
 maxRetriesPerRequest: null,
});

const queue = new Queue("jobs", { connection });

async function checkJobs() {
 const result = await pool.query(
  `
    SELECT * FROM jobs
    WHERE status = 'active'
    AND (
      (schedule_type = 'once' AND run_at <= NOW())
      OR
      (schedule_type = 'interval' AND next_run_at <= NOW())
    )
    `
 );

 for (const job of result.rows) {
  await queue.add("execute", job);

  await pool.query(
   `
      UPDATE jobs
      SET status = 'queued'
      WHERE id = $1
      `,
   [job.id]
  );

  console.log("Enqueued job:", job.id);
 }
}

setInterval(() => {
 checkJobs().catch(console.error);
}, 2000);

console.log("Scheduler running...");