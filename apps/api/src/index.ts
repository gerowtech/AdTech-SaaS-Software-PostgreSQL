import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { campaignsRouter } from "./routes/campaigns.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4001);

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/campaigns", campaignsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`AdPilot API listening at http://localhost:${port}`);
});
