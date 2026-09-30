-- ============================================================
-- SHE Scan: Supabase Database Schema & Row Level Security (RLS)
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  life_stages         TEXT[] NOT NULL DEFAULT '{}',
  diabetes_type       TEXT NOT NULL DEFAULT 'none',
  lactose_intolerant  BOOLEAN NOT NULL DEFAULT FALSE,
  allergies           TEXT[] NOT NULL DEFAULT '{}',
  custom_allergies    TEXT[] NOT NULL DEFAULT '{}',
  consent_given       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- 2. Scans History Table
CREATE TABLE IF NOT EXISTS public.scans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barcode       TEXT,
  source        TEXT NOT NULL, -- 'openfoodfacts' | 'ocr' | 'manual'
  product       JSONB NOT NULL,
  verdict       JSONB NOT NULL,
  explanation   TEXT,
  rules_version TEXT NOT NULL,
  scanned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON public.scans FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON public.scans(scanned_at DESC);


-- 3. Products Cache Table (Shared read cache)
CREATE TABLE IF NOT EXISTS public.products_cache (
  barcode       TEXT PRIMARY KEY,
  data          JSONB NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated or anonymous can read product cache"
  ON public.products_cache FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon'));

-- Product cache writes happen server-side through Edge Functions or secure background worker
