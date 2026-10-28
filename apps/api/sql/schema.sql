CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL CHECK (platform IN ('Meta', 'Google', 'TikTok', 'LinkedIn', 'Pinterest', 'Microsoft Ads', 'Snapchat', 'Other')),
  external_account_id VARCHAR(255),
  display_name VARCHAR(160) NOT NULL,
  connection_status VARCHAR(30) NOT NULL DEFAULT 'not_connected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
  name VARCHAR(180) NOT NULL,
  platform VARCHAR(30) NOT NULL CHECK (platform IN ('Meta', 'Google', 'TikTok', 'LinkedIn', 'Pinterest', 'Microsoft Ads', 'Snapchat', 'Other')),
  objective VARCHAR(40) NOT NULL DEFAULT 'Conversions',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft', 'completed')),
  daily_budget NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (daily_budget >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  clicks BIGINT NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  spend NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (spend >= 0),
  conversions INTEGER NOT NULL DEFAULT 0 CHECK (conversions >= 0),
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (revenue >= 0),
  UNIQUE (campaign_id, metric_date)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan VARCHAR(30) NOT NULL DEFAULT 'starter',
  status VARCHAR(30) NOT NULL DEFAULT 'trial',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_campaign_date ON daily_metrics(campaign_id, metric_date);
