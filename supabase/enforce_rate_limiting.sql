-- Server-side rate limiting for message inserts
-- Prevents users from sending >5 messages within 10 seconds
-- Run this in Supabase SQL Editor

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count INTEGER;
  rate_limit_window INTERVAL := '10 seconds';
  rate_limit_max INTEGER := 5;
BEGIN
  -- Count messages from this sender in the last 10 seconds
  SELECT COUNT(*)
  INTO message_count
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - rate_limit_window;

  -- If user has sent >= 5 messages in the last 10 seconds, reject
  IF message_count >= rate_limit_max THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down and try again in a few seconds.'
      USING ERRCODE = '42P01', -- Using a custom error code
            HINT = 'You can send up to 5 messages per 10 seconds.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce rate limiting on message inserts
DROP TRIGGER IF EXISTS enforce_message_rate_limit ON messages;

CREATE TRIGGER enforce_message_rate_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_rate_limit();

-- Verify the trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'enforce_message_rate_limit';
