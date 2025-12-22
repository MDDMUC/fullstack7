-- Create analytics_events table for tracking user activity
-- Purpose: Enable retention metrics, funnels, and B2B sponsor decks
-- Owner: Eng + Product
-- Created: 2025-12-22

-- Drop table if exists (for development/testing only)
-- DROP TABLE IF EXISTS analytics_events CASCADE;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL CHECK (event_name IN (
    'signup',
    'app_open',
    'match_created',
    'message_sent',
    'event_view',
    'event_rsvp',
    'invite_sent',
    'invite_accepted'
  )),
  event_ts timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  city_id text,
  gym_id uuid REFERENCES gyms(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
  ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name
  ON analytics_events(event_name);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_ts
  ON analytics_events(event_ts DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_city_id
  ON analytics_events(city_id)
  WHERE city_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
  ON analytics_events(session_id);

-- GIN index for JSONB queries (for filtering by properties)
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties
  ON analytics_events USING gin(properties);

-- Composite index for retention queries (user + time)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time
  ON analytics_events(user_id, event_ts DESC);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can insert their own events
CREATE POLICY "analytics_events_insert_own" ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Only allow SELECT for admin role (or service role)
-- For MVP, we'll restrict to service_role only (accessed via /admin/metrics with server-side queries)
-- Users cannot read analytics events directly
CREATE POLICY "analytics_events_select_service_role_only" ON analytics_events
  FOR SELECT
  TO service_role
  USING (true);

-- Note: Update and Delete not allowed - events are immutable
-- No UPDATE or DELETE policies = no one can modify or delete events

-- Grant permissions
GRANT INSERT ON analytics_events TO authenticated;
GRANT SELECT ON analytics_events TO service_role;

-- Comment on table
COMMENT ON TABLE analytics_events IS 'User activity tracking for retention metrics, funnels, and sponsor reporting';

-- Comment on columns
COMMENT ON COLUMN analytics_events.event_name IS 'Event type: signup, app_open, match_created, message_sent, event_view, event_rsvp, invite_sent, invite_accepted';
COMMENT ON COLUMN analytics_events.event_ts IS 'When the event occurred (user timezone converted to UTC)';
COMMENT ON COLUMN analytics_events.user_id IS 'User who triggered the event';
COMMENT ON COLUMN analytics_events.session_id IS 'Browser session identifier (stored in sessionStorage)';
COMMENT ON COLUMN analytics_events.properties IS 'Event-specific metadata as JSON';
COMMENT ON COLUMN analytics_events.city_id IS 'User city for geographic segmentation';
COMMENT ON COLUMN analytics_events.gym_id IS 'Related gym for gym-specific events';
COMMENT ON COLUMN analytics_events.created_at IS 'When the event was inserted into the database';

-- Create a view for common retention queries
CREATE OR REPLACE VIEW analytics_retention_cohorts AS
SELECT
  DATE_TRUNC('day', signup.event_ts) AS cohort_date,
  COUNT(DISTINCT signup.user_id) AS users_signed_up,
  COUNT(DISTINCT CASE
    WHEN d1.event_ts IS NOT NULL
    THEN signup.user_id
  END) AS day_1_retained,
  COUNT(DISTINCT CASE
    WHEN d7.event_ts IS NOT NULL
    THEN signup.user_id
  END) AS day_7_retained,
  COUNT(DISTINCT CASE
    WHEN d30.event_ts IS NOT NULL
    THEN signup.user_id
  END) AS day_30_retained
FROM analytics_events signup
LEFT JOIN analytics_events d1 ON
  d1.user_id = signup.user_id
  AND d1.event_name = 'app_open'
  AND DATE_TRUNC('day', d1.event_ts) = DATE_TRUNC('day', signup.event_ts) + INTERVAL '1 day'
LEFT JOIN analytics_events d7 ON
  d7.user_id = signup.user_id
  AND d7.event_name = 'app_open'
  AND DATE_TRUNC('day', d7.event_ts) = DATE_TRUNC('day', signup.event_ts) + INTERVAL '7 days'
LEFT JOIN analytics_events d30 ON
  d30.user_id = signup.user_id
  AND d30.event_name = 'app_open'
  AND DATE_TRUNC('day', d30.event_ts) = DATE_TRUNC('day', signup.event_ts) + INTERVAL '30 days'
WHERE signup.event_name = 'signup'
GROUP BY cohort_date
ORDER BY cohort_date DESC;

COMMENT ON VIEW analytics_retention_cohorts IS 'Daily cohort retention metrics (Day 1, 7, 30)';

-- Create a view for match funnel
CREATE OR REPLACE VIEW analytics_match_funnel AS
SELECT
  DATE_TRUNC('day', signup.event_ts) AS cohort_date,
  COUNT(DISTINCT signup.user_id) AS total_users,
  COUNT(DISTINCT match.user_id) AS users_with_match,
  COUNT(DISTINCT msg.user_id) AS users_who_messaged,
  ROUND(
    100.0 * COUNT(DISTINCT match.user_id) / NULLIF(COUNT(DISTINCT signup.user_id), 0),
    2
  ) AS match_rate_pct,
  ROUND(
    100.0 * COUNT(DISTINCT msg.user_id) / NULLIF(COUNT(DISTINCT match.user_id), 0),
    2
  ) AS message_rate_pct
FROM analytics_events signup
LEFT JOIN analytics_events match ON
  match.user_id = signup.user_id
  AND match.event_name = 'match_created'
  AND match.event_ts >= signup.event_ts
  AND match.event_ts <= signup.event_ts + INTERVAL '7 days'
LEFT JOIN analytics_events msg ON
  msg.user_id = signup.user_id
  AND msg.event_name = 'message_sent'
  AND msg.event_ts >= match.event_ts
  AND msg.event_ts <= match.event_ts + INTERVAL '1 day'
WHERE signup.event_name = 'signup'
GROUP BY cohort_date
ORDER BY cohort_date DESC;

COMMENT ON VIEW analytics_match_funnel IS 'Match creation and messaging funnel by signup cohort';

-- Create a view for event funnel
CREATE OR REPLACE VIEW analytics_event_funnel AS
SELECT
  DATE_TRUNC('day', view.event_ts) AS view_date,
  COUNT(DISTINCT view.user_id) AS users_viewed_event,
  COUNT(DISTINCT rsvp.user_id) AS users_rsvped,
  ROUND(
    100.0 * COUNT(DISTINCT rsvp.user_id) / NULLIF(COUNT(DISTINCT view.user_id), 0),
    2
  ) AS rsvp_conversion_pct
FROM analytics_events view
LEFT JOIN analytics_events rsvp ON
  rsvp.user_id = view.user_id
  AND rsvp.event_name = 'event_rsvp'
  AND rsvp.properties->>'event_id' = view.properties->>'event_id'
  AND rsvp.event_ts >= view.event_ts
  AND rsvp.event_ts <= view.event_ts + INTERVAL '7 days'
WHERE view.event_name = 'event_view'
GROUP BY view_date
ORDER BY view_date DESC;

COMMENT ON VIEW analytics_event_funnel IS 'Event browse → RSVP conversion funnel';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'analytics_events table created successfully';
  RAISE NOTICE 'Created 7 indexes for performance';
  RAISE NOTICE 'Enabled RLS with insert policy for authenticated users';
  RAISE NOTICE 'Created 3 analytical views: retention_cohorts, match_funnel, event_funnel';
END $$;
