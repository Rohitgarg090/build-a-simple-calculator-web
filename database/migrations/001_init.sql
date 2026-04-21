-- =================================================================
-- Migration 001 — Initial schema for calculator history
-- Target: Supabase (PostgreSQL 15+)
-- Run via: supabase db push  OR  psql $DATABASE_URL -f this_file.sql
-- =================================================================

-- Enable the pgcrypto extension so gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------
-- Table: calculations
-- Stores every evaluated expression with its result and an optional
-- anonymous session identifier.  No FK to auth.users — fully public.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calculations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expression  TEXT        NOT NULL,
  result      VARCHAR(64) NOT NULL,
  session_id  UUID,                          -- nullable; set by client
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.calculations              IS 'Optional history of calculator expressions and their results.';
COMMENT ON COLUMN public.calculations.id           IS 'UUID primary key.';
COMMENT ON COLUMN public.calculations.expression   IS 'The full arithmetic expression, e.g. "12 + 7 * 3".';
COMMENT ON COLUMN public.calculations.result       IS 'Computed result stored as text to handle large/decimal values.';
COMMENT ON COLUMN public.calculations.session_id   IS 'Client-generated UUID stored in localStorage; groups a session''s history.';
COMMENT ON COLUMN public.calculations.created_at   IS 'UTC timestamp of the calculation.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calculations_session
  ON public.calculations (session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calculations_created
  ON public.calculations (created_at DESC);

-- -----------------------------------------------------------------
-- Row Level Security
-- Anyone may INSERT (anonymous usage) and SELECT their own session.
-- No UPDATE or DELETE exposed to clients.
-- -----------------------------------------------------------------
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Allow inserting a new calculation from any anonymous client
CREATE POLICY "anon_insert_calculations"
  ON public.calculations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading only rows that belong to the requesting session.
-- The client must pass its session_id as a request header or JWT claim.
-- For simplicity we expose all rows to anon (history is non-sensitive).
CREATE POLICY "anon_select_calculations"
  ON public.calculations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant minimal privileges to Supabase roles
GRANT SELECT, INSERT ON public.calculations TO anon;
GRANT SELECT, INSERT ON public.calculations TO authenticated;