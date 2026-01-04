-- Enable Realtime for crew_invites table
-- This allows Supabase to send real-time updates when crew invites are created/updated

-- Set replica identity to FULL so all columns are included in the realtime payload
ALTER TABLE crew_invites REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
-- This enables real-time subscriptions for INSERT, UPDATE, DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE crew_invites;

-- Verify the publication (optional check)
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'crew_invites';
