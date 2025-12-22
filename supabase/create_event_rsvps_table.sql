-- Create event_rsvps table for event attendance
-- Purpose: Track RSVPs and keep event slots_open in sync
-- Owner: Eng + Product
-- Created: 2025-12-22

CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id
  ON event_rsvps(event_id);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id
  ON event_rsvps(user_id);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_rsvps_select_own" ON event_rsvps
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "event_rsvps_insert_own" ON event_rsvps
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_rsvps_delete_own" ON event_rsvps
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON event_rsvps TO authenticated;

-- Maintain updated_at timestamp
CREATE OR REPLACE FUNCTION set_event_rsvps_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_rsvps_set_updated_at ON event_rsvps;
CREATE TRIGGER event_rsvps_set_updated_at
BEFORE UPDATE ON event_rsvps
FOR EACH ROW EXECUTE FUNCTION set_event_rsvps_updated_at();

-- Keep events.slots_open in sync when RSVPs change
CREATE OR REPLACE FUNCTION adjust_event_slots_on_rsvp()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET slots_open = CASE
      WHEN slots_open IS NULL THEN NULL
      WHEN slots_open <= 0 THEN 0
      ELSE slots_open - 1
    END
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET slots_open = CASE
      WHEN slots_open IS NULL THEN NULL
      WHEN slots_total IS NULL THEN slots_open + 1
      ELSE LEAST(slots_open + 1, slots_total)
    END
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS event_rsvps_adjust_slots_ins ON event_rsvps;
CREATE TRIGGER event_rsvps_adjust_slots_ins
AFTER INSERT ON event_rsvps
FOR EACH ROW EXECUTE FUNCTION adjust_event_slots_on_rsvp();

DROP TRIGGER IF EXISTS event_rsvps_adjust_slots_del ON event_rsvps;
CREATE TRIGGER event_rsvps_adjust_slots_del
AFTER DELETE ON event_rsvps
FOR EACH ROW EXECUTE FUNCTION adjust_event_slots_on_rsvp();
