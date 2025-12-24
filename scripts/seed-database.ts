/**
 * Seed script to migrate mockData.ts locations to Supabase
 * 
 * Usage:
 * 1. First, create the locations table by running scripts/create-locations-table.sql in Supabase SQL Editor
 * 2. Run: npx ts-node --esm scripts/seed-database.ts
 * 
 * Or manually copy the generated INSERT statements from the console
 */

import { mockLocations } from '../src/data/mockData';

// Generate SQL INSERT statements for all locations
function generateInsertStatements(): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const values = mockLocations.map((loc, _index) => {
    const images = `'{${loc.images.map(img => `"${img}"`).join(',')}}'`;
    const tags = `'{${loc.tags.map(tag => `"${tag}"`).join(',')}}'`;
    const description = loc.description.replace(/'/g, "''"); // Escape single quotes

    return `(
    '${loc.name}',
    '${loc.type}',
    '${loc.region}',
    ${loc.coordinates.lat},
    ${loc.coordinates.lng},
    ${loc.elevation},
    '${description}',
    ${images},
    ${tags},
    '{}'
  )`;
  });

  return `-- Insert all locations from mockData.ts
-- Run this in Supabase Dashboard > SQL Editor AFTER creating the table

INSERT INTO locations (name, type, region, latitude, longitude, elevation, description, images, tags, related_location_ids)
VALUES
${values.join(',\n')};
`;
}

// Output the SQL
console.log(generateInsertStatements());
console.log('\n-- Total locations:', mockLocations.length);
