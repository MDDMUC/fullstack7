-- Create Push Notification Tables
-- Purpose: Store device tokens and user preferences for push notifications
-- Ticket: TICKET-NOT-001
-- Provider: Firebase Cloud Messaging (FCM) with Web Push API

BEGIN;

--------------------------------------------------------------------------------
-- Table: push_tokens
-- Stores device-specific push notification tokens for each user
--------------------------------------------------------------------------------

CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- FCM/Web Push token data
    token TEXT NOT NULL,  -- FCM registration token
    endpoint TEXT NOT NULL,  -- Web Push endpoint URL
    p256dh_key TEXT NOT NULL,  -- Public key for message encryption (base64)
    auth_key TEXT NOT NULL,  -- Authentication secret for encryption (base64)

    -- Device metadata
    device_type TEXT NOT NULL CHECK (device_type IN ('web', 'ios', 'android')),
    device_name TEXT,  -- e.g., "iPhone 14 Pro - Safari", "Chrome on Windows"
    user_agent TEXT,  -- Browser/device user agent string

    -- Token lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate tokens for same device
    UNIQUE(user_id, endpoint)
);

-- Indexes for performance
CREATE INDEX idx_push_tokens_user_active ON push_tokens(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_push_tokens_cleanup ON push_tokens(is_active, last_used_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_push_tokens_updated_at();

--------------------------------------------------------------------------------
-- Table: push_preferences
-- Stores user-level push notification preferences
--------------------------------------------------------------------------------

CREATE TABLE push_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE,  -- Master opt-in toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE TRIGGER push_preferences_updated_at
    BEFORE UPDATE ON push_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_push_tokens_updated_at();

--------------------------------------------------------------------------------
-- RLS Policies: push_tokens
--------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own tokens
CREATE POLICY "Users can view own push tokens"
ON push_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert own push tokens"
ON push_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own push tokens"
ON push_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own push tokens"
ON push_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- RLS Policies: push_preferences
--------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE push_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own push preferences"
ON push_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own push preferences"
ON push_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own push preferences"
ON push_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own push preferences"
ON push_preferences
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- Verification Queries
--------------------------------------------------------------------------------

-- List all tables and policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd AS command,
    permissive,
    roles
FROM pg_policies
WHERE tablename IN ('push_tokens', 'push_preferences')
ORDER BY tablename, cmd, policyname;

-- Verify indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('push_tokens', 'push_preferences')
ORDER BY tablename, indexname;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Push notification tables created successfully!';
    RAISE NOTICE 'Tables: push_tokens, push_preferences';
    RAISE NOTICE 'Next step: Configure Firebase and generate VAPID keys';
END $$;
