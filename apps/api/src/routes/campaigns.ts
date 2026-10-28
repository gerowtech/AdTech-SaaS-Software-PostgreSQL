import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const campaignsRouter = Router();

// Starter demo tenant. Replace with authenticated organization context before production.
const DEMO_ORG_ID = "11111111-1111-4111-8111-111111111111";

const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(180),
  platform: z.enum(["Meta", "Google", "TikTok", "LinkedIn", "Other"]),
  objective: z.enum(["Conversions", "Traffic", "Awareness", "Leads", "App installs"]).default("Conversions"),
  status: z.enum(["active", "paused", "draft", "completed"]).default("draft"),
  daily_budget: z.number().min(0).max(1_000_000),
});

campaignsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.platform, c.objective, c.status,
              c.daily_budget::float AS daily_budget, c.created_at,
              COALESCE(SUM(m.impressions), 0)::bigint AS impressions,
              COALESCE(SUM(m.clicks), 0)::bigint AS clicks,
              COALESCE(SUM(m.spend), 0)::float AS spend,
              COALESCE(SUM(m.conversions), 0)::bigint AS conversions,
              COALESCE(SUM(m.revenue), 0)::float AS revenue
       FROM campaigns c
       LEFT JOIN daily_metrics m ON m.campaign_id = c.id
       WHERE c.organization_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [DEMO_ORG_ID],
    );
    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get("/summary", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(m.spend), 0)::float AS spend,
         COALESCE(SUM(m.impressions), 0)::bigint AS impressions,
         COALESCE(SUM(m.clicks), 0)::bigint AS clicks,
         COALESCE(SUM(m.conversions), 0)::bigint AS conversions,
         COALESCE(SUM(m.revenue), 0)::float AS revenue,
         COUNT(DISTINCT c.id)::int AS campaigns
       FROM campaigns c
       LEFT JOIN daily_metrics m ON m.campaign_id = c.id
       WHERE c.organization_id = $1`,
      [DEMO_ORG_ID],
    );
    const row = result.rows[0];
    const spend = Number(row.spend);
    const clicks = Number(row.clicks);
    const impressions = Number(row.impressions);
    res.json({
      data: {
        ...row,
        ctr: impressions ? (clicks / impressions) * 100 : 0,
        cpc: clicks ? spend / clicks : 0,
        roas: spend ? Number(row.revenue) / spend : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post("/", async (req, res, next) => {
  const parsed = createCampaignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid campaign data", details: parsed.error.flatten() });
    return;
  }

  try {
    const { name, platform, objective, status, daily_budget } = parsed.data;
    const result = await pool.query(
      `INSERT INTO campaigns (organization_id, name, platform, objective, status, daily_budget)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, platform, objective, status, daily_budget::float AS daily_budget, created_at`,
      [DEMO_ORG_ID, name, platform, objective, status, daily_budget],
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

campaignsRouter.patch("/:id/status", async (req, res, next) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const status = z.enum(["active", "paused", "draft", "completed"]).safeParse(req.body?.status);
  if (!id.success || !status.success) {
    res.status(400).json({ error: "A valid campaign ID and status are required." });
    return;
  }
  try {
    const result = await pool.query(
      `UPDATE campaigns SET status = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3
       RETURNING id, name, status`,
      [status.data, id.data, DEMO_ORG_ID],
    );
    if (!result.rowCount) {
      res.status(404).json({ error: "Campaign not found." });
      return;
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

campaignsRouter.delete("/:id", async (req, res, next) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) {
    res.status(400).json({ error: "A valid campaign ID is required." });
    return;
  }
  try {
    const result = await pool.query(
      "DELETE FROM campaigns WHERE id = $1 AND organization_id = $2 RETURNING id",
      [id.data, DEMO_ORG_ID],
    );
    if (!result.rowCount) {
      res.status(404).json({ error: "Campaign not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
