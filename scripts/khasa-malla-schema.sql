-- Khasa Malla Historical Sites Table Schema
-- Run this in Supabase Dashboard > SQL Editor FIRST

-- Drop existing table if you want to start fresh (optional)
-- DROP TABLE IF EXISTS historical_sites;

CREATE TABLE IF NOT EXISTS historical_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_no TEXT,
  country TEXT NOT NULL DEFAULT 'Nepal',
  district TEXT,
  location TEXT NOT NULL,
  coordinates TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  site_type TEXT NOT NULL,
  documentation TEXT,
  description TEXT,
  visit_date DATE,
  phase INTEGER,
  language TEXT,
  translation TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE historical_sites ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON historical_sites
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hs_country ON historical_sites(country);
CREATE INDEX IF NOT EXISTS idx_hs_district ON historical_sites(district);
CREATE INDEX IF NOT EXISTS idx_hs_type ON historical_sites(site_type);
CREATE INDEX IF NOT EXISTS idx_hs_location ON historical_sites(location);

COMMENT ON TABLE historical_sites IS 'Khasa Malla historical and archaeological sites documentation';
