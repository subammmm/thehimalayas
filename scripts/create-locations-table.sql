-- Locations table for The Himalayas Research Database
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Create the locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Peak', 'Valley', 'Lake', 'Monastery', 'Village', 'Route/Trek', 'Glacier', 'Basecamp')),
  region TEXT NOT NULL CHECK (region IN ('Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Kanchenjunga', 'Makalu', 'Dolpo', 'Mustang')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  elevation INTEGER NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  related_location_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON locations
  FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- Add comment
COMMENT ON TABLE locations IS 'Himalayan locations including peaks, lakes, monasteries, villages, and trekking routes';
