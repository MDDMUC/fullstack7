-- FIX_RLS_NUCLEAR.sql
-- Purpose: Nuclear cleanup of messages RLS + comprehensive block enforcement
-- This script is the definitive fix for TICKET-TNS-001 (Block Enforcement Failure)
--
-- CRITICAL FIXES:
-- 1. Dynamically drops ALL INSERT policies on messages (no hardcoded names)
-- 2. Checks BOTH directions of blocking (sender blocked by receiver AND sender has blocked receiver)
-- 3. Uses SECURITY DEFINER function to bypass blocks table RLS visibility
-- 4. Ensures rate limiting trigger is correct
--
-- Run this entire script in Supabase SQL Editor.

BEGIN;

--------------------------------------------------------------------------------
-- STEP 1: NUCLEAR CLEANUP - Drop ALL INSERT policies on messages table
--------------------------------------------------------------------------------

-- This dynamic block finds and drops every INSERT policy, regardless of name
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Query pg_policies for all INSERT policies on messages table
    FOR policy_record IN (
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'messages'
          AND schemaname = 'public'
          AND cmd = 'INSERT'
    ) LOOP
        -- Drop each policy dynamically
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

--------------------------------------------------------------------------------
-- STEP 2: Create SECURITY DEFINER helper function
--------------------------------------------------------------------------------

-- This function checks if there is ANY blocking relationship between sender and thread participants
-- Returns TRUE if sender should be blocked from sending messages
-- Uses SECURITY DEFINER to bypass RLS on the blocks table
CREATE OR REPLACE FUNCTION is_sender_blocked_from_thread(
    p_thread_id UUID,
    p_sender_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Runs with elevated permissions to read blocks table
SET search_path = public -- Secure search path
AS $$
DECLARE
    has_block_issue BOOLEAN;
BEGIN
    -- Check if there is ANY block relationship between sender and other thread participants
    -- This includes:
    --   1. Sender is blocked by any participant
    --   2. Sender has blocked any participant
    SELECT EXISTS (
        SELECT 1
        FROM thread_participants tp
        INNER JOIN blocks b ON (
            -- Case 1: Participant blocked the sender
            (b.blocker_id = tp.user_id AND b.blocked_id = p_sender_id)
            OR
            -- Case 2: Sender blocked the participant
            (b.blocker_id = p_sender_id AND b.blocked_id = tp.user_id)
        )
        WHERE tp.thread_id = p_thread_id
          AND tp.user_id != p_sender_id -- Don't check sender against themselves
    ) INTO has_block_issue;

    RETURN has_block_issue;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_sender_blocked_from_thread(UUID, UUID) TO authenticated;

--------------------------------------------------------------------------------
-- STEP 3: Create single, comprehensive INSERT policy
--------------------------------------------------------------------------------

CREATE POLICY "messages_insert_with_blocks_and_participants"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
    -- Condition 1: User must be the sender
    auth.uid() = sender_id

    AND

    -- Condition 2: User must be a participant in the thread
    EXISTS (
        SELECT 1
        FROM thread_participants tp
        WHERE tp.thread_id = messages.thread_id
          AND tp.user_id = auth.uid()
    )

    AND

    -- Condition 3: No blocking relationship exists
    -- Uses SECURITY DEFINER function to bypass RLS on blocks table
    NOT is_sender_blocked_from_thread(messages.thread_id, auth.uid())
);

--------------------------------------------------------------------------------
-- STEP 4: Ensure rate limiting trigger is correct
--------------------------------------------------------------------------------

-- Drop and recreate to ensure clean state
DROP TRIGGER IF EXISTS enforce_message_rate_limit ON messages;
DROP FUNCTION IF EXISTS check_message_rate_limit();

-- Rate limit function: max 5 messages per 10 seconds per user
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    msg_count INTEGER;
BEGIN
    -- Count messages from this sender in the last 10 seconds
    SELECT COUNT(*)
    INTO msg_count
    FROM messages
    WHERE sender_id = NEW.sender_id
      AND created_at > (NOW() - INTERVAL '10 seconds');

    -- If count is already 5, this would be the 6th message (reject)
    IF msg_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please slow down.'
            USING ERRCODE = 'P0001', -- Standard user-defined exception
                  HINT = 'Maximum 5 messages per 10 seconds.';
    END IF;

    RETURN NEW;
END;
$$;

-- Attach trigger to messages table
CREATE TRIGGER enforce_message_rate_limit
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_rate_limit();

--------------------------------------------------------------------------------
-- STEP 5: Verification queries
--------------------------------------------------------------------------------

-- List all policies on messages table (should show only 1 INSERT policy)
SELECT
    schemaname,
    tablename,
    policyname,
    cmd AS command,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- Verify rate limiting trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'enforce_message_rate_limit';

-- Verify SECURITY DEFINER function exists
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_name = 'is_sender_blocked_from_thread';

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Nuclear RLS fix applied successfully!';
    RAISE NOTICE 'Run QA automation script to verify: npx tsx scripts/qa-safety-automation.ts';
END $$;
