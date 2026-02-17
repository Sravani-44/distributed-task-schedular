import express from "express";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const app = express();
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/health", (_req, res) => {
 res.json({ message: "Server running 🚀" });
});

/* ---------------- GET ALL JOBS ---------------- */
app.get("/jobs", async (_req, res) => {
 try {
  const result = await pool.query(
   "SELECT * FROM jobs ORDER BY created_at DESC"
  );
  return res.json(result.rows);
 } catch (err: any) {
  console.error("GET /jobs error:", err?.message || err);
  return res.status(500).json({ error: err?.message || "Database error" });
 }
});

/* ---------------- CREATE JOB ---------------- */
app.post("/jobs", async (req, res) => {
 try {
  const {
   name,
   type,
   payload,
   schedule_type,
   run_at,
   interval_seconds,
  } = req.body;

  /* ---------- Basic Validation ---------- */
  if (!name || !type || !payload || !schedule_type) {
   return res.status(400).json({
    error:
     "Missing required fields: name, type, payload, schedule_type",
   });
  }

  if (schedule_type === "once" && !run_at) {
   return res.status(400).json({
    error: "run_at is required when schedule_type is 'once'",
   });
  }

  if (schedule_type === "interval" && !interval_seconds) {
   return res.status(400).json({
    error:
     "interval_seconds is required when schedule_type is 'interval'",
   });
  }

  /* ---------- Calculate next_run_at ---------- */
  let next_run_at: Date;

  if (schedule_type === "once") {
   next_run_at = new Date(run_at);
  } else {
   next_run_at = new Date(
    Date.now() + Number(interval_seconds) * 1000
   );
  }

  /* ---------- Insert Job ---------- */
  const result = await pool.query(
   `
      INSERT INTO jobs 
      (name, type, payload, schedule_type, run_at, interval_seconds, next_run_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
   [
    name,
    type,
    payload,
    schedule_type,
    run_at ? new Date(run_at) : null,
    interval_seconds ?? null,
    next_run_at,
   ]
  );

  return res.status(201).json(result.rows[0]);
 } catch (err: any) {
  console.error("POST /jobs error:", err?.message || err);
  return res.status(500).json({
   error: err?.message || "Server error",
  });
 }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});