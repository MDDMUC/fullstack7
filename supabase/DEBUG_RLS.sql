-- DEBUG_RLS.sql
-- Run this in Supabase SQL Editor to see the exact state of your table security.

SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    pol.polname AS policy_name,
    pol.polcmd AS policy_command, -- 'r' = SELECT, 'a' = INSERT, 'w' = UPDATE, 'd' = DELETE
    pg_get_expr(pol.polqual, pol.polrelid) AS policy_definition,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_definition
FROM pg_class c
LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
WHERE c.relname = 'messages';
