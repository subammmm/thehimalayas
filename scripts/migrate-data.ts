
import { createClient } from '@supabase/supabase-js';
import { mockLocations } from '../src/data/mockData';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

try {
    const envConfig = dotenv.parse(readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (_e) {
    console.log("Could not load .env file, checking process.env");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://frpjuymnrdrtmnwnnigx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycGp1eW1ucmRydG1ud25uaWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjYzOTksImV4cCI6MjA4MTMwMjM5OX0.lhi4lT1YNDTJMRQWb0R429vrXvvL5obbrw88nHx-xCA';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log(`Starting migration of ${mockLocations.length} locations...`);

    // Check if table exists/is accessible by trying to select 1 item
    const { error: checkError } = await supabase.from('locations').select('id').limit(1);

    if (checkError) {
        if (checkError.code === '42P01') { // undefined_table
            console.error('\n❌ ERROR: The "locations" table does not exist yet.');
            console.error('You MUST run the "Create Table" SQL in your Supabase Dashboard first.');
            console.error('Use the SQL provided in scripts/create-locations-table.sql');
            return;
        }
        console.error('Error checking database:', checkError.message);
        // Continue anyway in case it's just an empty table RLS issue (though likely RLS prevents reading if not policy)
    }

    // Check for existing records to prevent duplicates
    const { data: existing } = await supabase.from('locations').select('name');
    const existingNames = new Set(existing?.map(e => e.name) || []);

    // Prepare data
    // Map existing structure to database structure (snake_case)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const records = mockLocations.map((loc, _index) => ({
        name: loc.name,
        type: loc.type,
        region: loc.region,
        latitude: loc.coordinates.lat,
        longitude: loc.coordinates.lng,
        elevation: Math.round(loc.elevation), // Fix: Round to integer for DB
        description: loc.description,
        images: loc.images,
        tags: loc.tags,
        related_location_ids: []
    }));

    // Filter out records that are already uploaded
    const newRecords = records.filter(r => !existingNames.has(r.name));

    if (newRecords.length === 0) {
        console.log('All locations already exist in database.');
        return;
    }

    console.log(`Found ${existingNames.size} existing records. Uploading ${newRecords.length} new records...`);

    // Insert in batches of 10 to be safe
    const batchSize = 10;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < newRecords.length; i += batchSize) {
        const batch = newRecords.slice(i, i + batchSize);
        const { data, error } = await supabase.from('locations').insert(batch).select();

        if (error) {
            console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
            failCount += batch.length;
        } else {
            successCount += data.length;
            console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(newRecords.length / batchSize)}`);
        }
    }

    console.log('\nMigration Complete!');
    console.log(`✅ Successfully inserted: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
}

migrate();
