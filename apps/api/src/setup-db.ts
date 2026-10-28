import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = await fs.readFile(path.resolve(here, "../sql/schema.sql"), "utf8");
const seed = await fs.readFile(path.resolve(here, "../sql/seed.sql"), "utf8");

try {
  await pool.query("BEGIN");
  await pool.query(schema);
  await pool.query(seed);
  await pool.query("COMMIT");
  console.log("Database schema is ready. Ten demo campaigns are seeded (safe to rerun).");
} catch (error) {
  await pool.query("ROLLBACK").catch(() => undefined);
  console.error("Database setup failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
