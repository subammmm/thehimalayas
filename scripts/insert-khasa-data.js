// Script to insert Khasa Malla data into Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frpjuymnrdrtmnwnnigx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycGp1eW1ucmRydG1ud25uaWd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTcyNjM5OSwiZXhwIjoyMDgxMzAyMzk5fQ.xdWAHsn67ZIebvJl4d6oo2iRV_tZf1SXPLaKpw3m65E';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// First, create the table
async function createTable() {
    console.log('Creating historical_sites table...');

    const { error } = await supabase.rpc('exec_sql', {
        sql: `
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
    `
    });

    if (error) {
        console.log('Table might already exist or RPC not available, trying direct insert...');
    }
}

// Sites data
const sites = [
    { entry_no: 'N.D.D.1', country: 'Nepal', district: 'Dailekh', location: 'Dullu', site_type: 'Stele', documentation: 'Alongside the Kritikhamba there were 7 other pillars. Kritikhamba measures 50x266.', description: 'The lineage of the kings of Yatse from the Dullu inscription. Stele roughly 2.5 metres tall with Om mani padme hum.', visit_date: '2025-01-27', phase: 1, source: 'Samuel Grimes / Giuseppe Tucci / Surya Mani Adhikary' },
    { entry_no: 'N.D.D.2', country: 'Nepal', district: 'Jumla', location: 'Michagaon', coordinates: '29.2717, 82.1568', site_type: 'Stupas / Stele', documentation: '14 stupas spread out. Stele 41x182x10.', description: '13 chörtens dating from 1482 to 1501 CE.' },
    { entry_no: 'N.D.D.3', country: 'Nepal', district: 'Surkhet', location: 'Birendranagar', site_type: 'Vihara', documentation: 'Scattered remains around vihara.', description: 'Kakre Vihar - oldest temple in Surkhet. Built 13th century by Ashoka Challa.', visit_date: '2025-01-25', phase: 1 },
    { entry_no: 'N.D.D.4', country: 'Nepal', district: 'Surkhet', location: 'Uttaraganga', site_type: 'Pillars', documentation: 'Two pillars. Horse capital at Jaleshwor temple.', description: 'Markers of ancient route to the south.', visit_date: '2025-01-26', phase: 1 },
    { entry_no: 'N.D.D.5', country: 'Nepal', district: 'Dailekh', location: 'Ramrikanda', site_type: 'Pillar', description: 'Pillar nearly 2m high with seven lines of text. Date Sake 1037.' },
    { entry_no: 'N.D.D.6', country: 'Nepal', district: 'Dailekh', location: 'Phinikanda', site_type: 'Pillars', description: 'Three pillar stones with Lhasa soldier image.' },
    { entry_no: 'N.D.D.7', country: 'Nepal', district: 'Surkhet', location: 'Chaughanchaur', site_type: 'Mounds', description: '13th century specimens. Ripu Mall mentioned in 14th century colophon.' },
    { entry_no: 'N.D.D.8', country: 'Nepal', district: 'Surkhet', location: 'Mangalgadhi', site_type: 'Fort', documentation: 'Pillar with Ananda Malla inscription.', description: 'Strategically important fort site.', visit_date: '2025-01-26', phase: 1 },
    { entry_no: 'N.D.D.9', country: 'Nepal', district: 'Surkhet', location: 'Province Museum', site_type: 'Pillar', documentation: 'Terracotta chaitya, lions, Buddha reliefs.', description: '4-sided pillar with Buddha/Maitreya/Tara/Lokeshwor.', visit_date: '2025-01-25', phase: 1 },
    { entry_no: 'N.D.D.10', country: 'Nepal', district: 'Dailekh', location: 'Patharnauli (Dullu)', coordinates: '28.8518, 81.6083', site_type: 'Water Receptacle', documentation: 'Stupa-like structure with epigraph.', description: 'Made by Devavarmii in 1334. Prthvimalla mentioned.', visit_date: '2025-01-29', phase: 1 },
    { entry_no: 'N.D.D.11', country: 'India', district: 'Bihar', location: 'Bodh Gaya', site_type: 'Copperplate Inscription', description: 'Ashok Challa inscriptions 1255-1278. Called himself Khasha-Rajadhiraja.' },
    { entry_no: 'N.D.D.12', country: 'India', district: 'Uttarakhand', location: 'Kumaon (Gopheshwar)', site_type: 'Temple Inscription', description: 'Krachalla conquered Kumaon in 1223 AD.' },
    { entry_no: 'N.D.D.13', country: 'India', district: 'Uttarakhand', location: 'Garhwal (Uttarkashi)', site_type: 'Temple Inscription', description: 'Ashoka Challa conquered Garhwal to Uttarkashi.' },
    { entry_no: 'N.D.D.14', country: 'Nepal', district: 'Dailekh', location: 'Padukasthan (Dullu)', site_type: 'Temple Complex', documentation: 'Buddha relief, warrior pillars.', description: 'First recorded use of Nepali language. Eternal flame site.', visit_date: '2025-01-29', phase: 1 },
    { entry_no: 'N.D.D.15', country: 'Nepal', district: 'Bajhang', location: 'Danduru Village', site_type: 'Copper Plate', description: 'Land grant of Abhayamalla.' },
    { entry_no: 'N.D.D.16', country: 'Nepal', district: 'Jumla', location: 'Seridhuska', site_type: 'Gold Plate', description: 'Land grant under Prthvimalla.' },
    { entry_no: 'N.D.D.17', country: 'Nepal', district: 'Jumla', location: 'Magistrate Office', site_type: 'Copper Plate', description: 'Land grant by Prithvimalla from Dullu.' },
    { entry_no: 'N.D.D.18', country: 'Nepal', district: 'Kalikot', location: 'Rainkasanghu', site_type: 'Stone Inscription', description: 'Malayavarma became ruler after Abhayamalla.' },
    { entry_no: 'N.D.D.19', country: 'Nepal', district: 'Achham', location: 'Jayagarh', site_type: 'Inscription', description: 'Yasovarma - Prithvimallas chief minister.' },
    { entry_no: 'N.D.D.20', country: 'Nepal', district: 'Achham', location: 'Kuchi (Kalikasthan)', site_type: 'Inscription on Reservoir', description: 'Devavarma inscription mentioning Prithivimalla.' },
    { entry_no: 'N.D.D.21', country: 'Nepal', district: 'Achham', location: 'Ghodasain', site_type: 'Inscription', description: 'Reference to Taradevi of Khasa court.' },
    { entry_no: 'N.D.D.22', country: 'Nepal', district: 'Achham', location: 'Binayak', site_type: 'Temple', description: 'Vinayak Panchadeval by Aksayamalla.' },
    { entry_no: 'N.D.D.23', country: 'Nepal', district: 'Dailekh', location: 'Nabhistan', site_type: 'Temple', description: 'Eternal flame site - natural gas.' },
    { entry_no: 'N.D.D.24', country: 'Nepal', district: 'Dailekh', location: 'Shreesthan', site_type: 'Temple', description: 'Eternal flame site.' },
    { entry_no: 'N.D.D.25', country: 'China', district: 'Tibet', location: 'Shiagtse', site_type: 'Monastery', description: 'Ripumalla copied Abhisamayalankara in 1313. First Vikram Sambat use.' },
    { entry_no: 'N.D.D.26', country: 'Nepal', district: 'Jumla', location: 'Sinja', site_type: 'Stone Inscription', description: 'Ripumalla copied Laghuratnatraya.' },
    { entry_no: 'N.D.D.27', country: 'China', district: 'Tibet', location: 'Taghwai Monastery', site_type: 'Copper Plate', description: 'Bilingual 1321 AD land grant. Adityamalla.' },
    { entry_no: 'N.D.D.28', country: 'China', district: 'Tibet', location: 'Taghwai Monastery', site_type: 'Copper Plate', description: '1328 AD land grant. Punyamalla.' },
    { entry_no: 'N.D.D.29', country: 'Nepal', district: 'Surkhet', location: 'Birendranagar', site_type: 'Stone Inscription', description: 'Inscription dated 1292.' },
    { entry_no: 'N.D.D.30', country: 'Nepal', district: 'Jumla', location: 'Seridhuska', coordinates: '29.2575, 82.1352', site_type: 'Stupa', documentation: 'Square base stupa with inscription.', description: 'Om mani padme hum in Ranjana script.' },
    { entry_no: 'N.D.D.31', country: 'Nepal', district: 'Achham', location: 'Bhandarigaun', site_type: 'Pillar', description: 'Buddha with standing Tara on roadside pillar.' },
    { entry_no: 'N.D.D.32', country: 'Nepal', district: 'Surkhet', location: 'Birendranagar', site_type: 'Carved Stone', description: 'Celestial nymph from Kankrevihar ruins.' },
    { entry_no: 'N.D.D.33', country: 'Nepal', district: 'Jumla', location: 'Lamathada (Sinja)', site_type: 'Stone Sculptures', description: 'Three life-sized stone lions from royal palace.' },
    { entry_no: 'N.D.D.34', country: 'Nepal', district: 'Kaski', location: 'Kaskikot', site_type: 'Fort Ruins', description: 'Ruins overlooking Pokhara valley.' },
    { entry_no: 'N.D.D.35', country: 'Nepal', district: 'Kalikot', location: 'Gela', site_type: 'Seat of Power', description: 'Punyamalla became king here.' },
    { entry_no: 'N.D.D.36', country: 'Nepal', district: 'Surkhet', location: 'Latikoili', site_type: 'Hindu Temple', documentation: 'Shiva temple 16th century.', description: 'Ram Krishna from Benares. Raskoti lineage.', visit_date: '2025-01-25' },
    { entry_no: 'N.D.D.37', country: 'Nepal', district: 'Dailekh', location: 'Dullu', site_type: 'Palace Ruins', documentation: 'Only foundation walls remain.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.38', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Malpot)', coordinates: '28.8649, 81.6071', site_type: 'Deval', documentation: 'Two devals side-by-side.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.39', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Malpot)', coordinates: '28.8648, 81.6068', site_type: 'Temple', documentation: 'Bijaya Bhagwati Mandir.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.40', country: 'Nepal', district: 'Dailekh', location: 'Dullu', coordinates: '28.8663, 81.6088', site_type: 'Pillar', documentation: '30x170 pillar on way to Baleshwor.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.41', country: 'Nepal', district: 'Dailekh', location: 'Dullu', coordinates: '28.8676, 81.6092', site_type: 'Pillars', documentation: '3 pillars in army camp.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.42', country: 'Nepal', district: 'Dailekh', location: 'Dullu', coordinates: '28.8692, 81.6088', site_type: 'Pillars', documentation: 'Two pillars with stupa. From 1323.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.43', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Baleshwor)', coordinates: '28.8781, 81.6089', site_type: 'Temple', documentation: 'Inscription with om mani padme hum.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.44', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Dhuleshwor)', site_type: 'Temple', documentation: 'Shiva Temple with Buddha sculpture.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.45', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Lamji)', coordinates: '28.8939, 81.6179', site_type: 'Deval (Panchadeval)', documentation: '5 devals with one in middle.', visit_date: '2025-01-27', phase: 1 },
    { entry_no: 'N.D.D.46', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Dadimadi)', coordinates: '28.9103, 81.6290', site_type: 'Pillar', documentation: 'Stupa and lotus motifs. 42x90.', visit_date: '2025-01-29', phase: 1 },
    { entry_no: 'N.D.D.47', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Dadimadi)', coordinates: '28.9124, 81.6287', site_type: 'Pillars', documentation: '12 pillars with Khasa typology.', visit_date: '2025-01-29', phase: 1 },
    { entry_no: 'N.D.D.48', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Satkhamba)', coordinates: '28.8371, 81.6249', site_type: 'Pillars', documentation: '7 pillars with inscriptions.', visit_date: '2025-01-28', phase: 1 },
    { entry_no: 'N.D.D.49', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Bela Baazar)', coordinates: '28.8310, 81.6308', site_type: 'Pillars', documentation: 'Two pillars 30x224 and 30x220.', visit_date: '2025-01-28', phase: 1 },
    { entry_no: 'N.D.D.50', country: 'Nepal', district: 'Dailekh', location: 'Dullu (Pushakot)', coordinates: '28.8303, 81.6311', site_type: 'Pillars', documentation: '4 pillars on hilltop.', visit_date: '2025-01-28', phase: 1 },
    { entry_no: 'N.D.D.51', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Duikhamba)', coordinates: '28.8287, 81.7096', site_type: 'Pillars', documentation: 'Two steles resembling Kritikhamba.', visit_date: '2025-01-30', phase: 1 },
    { entry_no: 'N.D.D.52', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Kuikana)', coordinates: '28.8354, 81.7000', site_type: 'Deval (Panchadeval)', documentation: '5 devals in Raskoti layout.', visit_date: '2025-01-30', phase: 1 },
    { entry_no: 'N.D.D.53', country: 'Nepal', district: 'Dailekh', location: 'Dailekh Baazar', site_type: 'Fort', documentation: 'Fort from Rasikot era.', visit_date: '2025-01-30', phase: 1 },
    { entry_no: 'N.D.D.54', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Charkhamba)', coordinates: '28.8421, 81.7104', site_type: 'Pillars', documentation: '4 pillars with spirals/triangles.', visit_date: '2025-01-30', phase: 1 },
    { entry_no: 'N.D.D.55', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Jharkot)', coordinates: '28.8558, 81.7087', site_type: 'Deval / Fountain', documentation: 'Single deval with fountain.', visit_date: '2025-01-31', phase: 1 },
    { entry_no: 'N.D.D.56', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Jharkot)', coordinates: '28.8564, 81.7148', site_type: 'Pillars', documentation: '5 pillars of different sizes.', visit_date: '2025-01-31', phase: 1 },
    { entry_no: 'N.D.D.57', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Bhurti)', coordinates: '28.8605, 81.7220', site_type: 'Deval (Panchadeval)', documentation: 'Raskoti layout, half broken.', visit_date: '2025-01-31', phase: 1 },
    { entry_no: 'N.D.D.58', country: 'Nepal', district: 'Dailekh', location: 'Dailekh (Bhurti)', coordinates: '28.8618, 81.7233', site_type: 'Temple Complex', documentation: '22 devals of all sizes.', visit_date: '2025-01-31' },
    { entry_no: 'N.D.D.59', country: 'Nepal', district: 'Kalikot', location: 'Manma', coordinates: '29.1452, 81.6028', site_type: 'Stele', documentation: 'Warrior on horse. 40x195x15.', visit_date: '2025-02-03', phase: 1 },
    { entry_no: 'N.D.D.60', country: 'Nepal', district: 'Kalikot', location: 'Manma', coordinates: '29.1438, 81.6034', site_type: 'Fountain', documentation: 'Khasa/Raskoti plan fountain.', visit_date: '2025-02-03', phase: 1 },
    { entry_no: 'N.D.D.61', country: 'Nepal', district: 'Kalikot', location: 'Manma', coordinates: '29.1429, 81.6022', site_type: 'Deval (Panchadeval)', documentation: 'Most detailed deval seen.', visit_date: '2025-02-03', phase: 1 },
    { entry_no: 'N.D.D.62', country: 'Nepal', district: 'Jumla', location: 'Chandannath Temple', site_type: 'Temple', documentation: 'Golden dome roof temple.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.63', country: 'Nepal', district: 'Jumla', location: 'Dansangu', coordinates: '29.2747, 82.2047', site_type: 'Pillar', documentation: 'Stele 44x105x13.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.64', country: 'Nepal', district: 'Jumla', location: 'Bigare', coordinates: '29.2689, 82.2204', site_type: 'Stupa / Fountain', documentation: 'Fountain with 3 stupas.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.65', country: 'Nepal', district: 'Jumla', location: 'Khala', coordinates: '29.2714, 82.2278', site_type: 'Stupa / Fountain', documentation: 'One stupa remains.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.66', country: 'Nepal', district: 'Jumla', location: 'Ukhadi', coordinates: '29.2641, 82.2495', site_type: 'Deval / Fountain', documentation: 'Intact deval with fountain.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.67', country: 'Nepal', district: 'Jumla', location: 'Garjyankot', coordinates: '29.2551, 82.2550', site_type: 'Stupa', documentation: 'Two side-by-side stupas.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.68', country: 'Nepal', district: 'Jumla', location: 'Guthichaur', coordinates: '29.2134, 82.3147', site_type: 'Deval / Fountain', documentation: 'Functional fountain, deval destroyed.', description: 'Seat of Pala Kingdom.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.69', country: 'Nepal', district: 'Jumla', location: 'Bhandaribada', coordinates: '29.2874, 82.1921', site_type: 'Stupa', documentation: 'Two stupas with sanctum.', visit_date: '2025-02-05' },
    { entry_no: 'N.D.D.70', country: 'Nepal', district: 'Jumla', location: 'Michagaon', coordinates: '29.2680, 82.1581', site_type: 'Pillar', documentation: 'Pillar 37x122x9.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.71', country: 'Nepal', district: 'Jumla', location: 'Umgad', coordinates: '29.2548, 82.1367', site_type: 'Pillars', documentation: '8 Khas era pillars.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.72', country: 'Nepal', district: 'Jumla', location: 'Seridhuska', coordinates: '29.2544, 82.1314', site_type: 'Pavilion', documentation: 'Stone pavilion 55x185x8.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.73', country: 'Nepal', district: 'Jumla', location: 'Tatopani', coordinates: '29.2372, 82.0720', site_type: 'Temple', documentation: 'Babira Masta Temple.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.74', country: 'Nepal', district: 'Jumla', location: 'Tatopani', coordinates: '29.2372, 82.0665', site_type: 'Stele', documentation: 'Stele 48x200x7.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.75', country: 'Nepal', district: 'Jumla', location: 'Tatopani', coordinates: '29.2374, 82.0654', site_type: 'Deval', documentation: 'Half deval remains.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.76', country: 'Nepal', district: 'Jumla', location: 'Sundargau', coordinates: '29.2316, 82.0650', site_type: 'Temple', documentation: 'Mani Malika Mandir.', visit_date: '2025-02-06' },
    { entry_no: 'N.D.D.77', country: 'Nepal', district: 'Jumla', location: 'Lihi', coordinates: '29.3121, 81.9819', site_type: 'Stupa / Pillar', documentation: 'Destroyed during Maoist era.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.78', country: 'Nepal', district: 'Jumla', location: 'Narakot', coordinates: '29.3252, 81.9825', site_type: 'Pillars', documentation: '4 pillars, 2 fallen.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.79', country: 'Nepal', district: 'Jumla', location: 'Bistabada', coordinates: '29.3563, 81.9696', site_type: 'Stele', documentation: 'Beaded outline. 42x124x10.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.80', country: 'Nepal', district: 'Jumla', location: 'Bistabada', coordinates: '29.3565, 81.9697', site_type: 'Deval', documentation: 'Curved deval design.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.81', country: 'Nepal', district: 'Jumla', location: 'Bistabada', coordinates: '29.3566, 81.9697', site_type: 'Museum', documentation: 'Khasa museum.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.82', country: 'Nepal', district: 'Jumla', location: 'Bistabada', coordinates: '29.3571, 81.9701', site_type: 'Deval', documentation: '3 devals of different sizes.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.83', country: 'Nepal', district: 'Jumla', location: 'Bistabada', coordinates: '29.3574, 81.9679', site_type: 'Fountain', documentation: 'Defunct fountain.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.84', country: 'Nepal', district: 'Jumla', location: 'Dhapa', coordinates: '29.3651, 81.9716', site_type: 'Temple', documentation: 'Bairam Mandir.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.85', country: 'Nepal', district: 'Jumla', location: 'Dhapa (Jacha)', coordinates: '29.3764, 81.9732', site_type: 'Fountain / Stele', documentation: 'Functional fountain. Oldest Tibetan text in Karnali.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.86', country: 'Nepal', district: 'Jumla', location: 'Thapribada', coordinates: '29.3811, 81.9784', site_type: 'Deval', documentation: 'Two devals facing each other.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.87', country: 'Nepal', district: 'Jumla', location: 'Thapribada', coordinates: '29.3809, 81.9786', site_type: 'Fountain', documentation: 'Classical layout.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.88', country: 'Nepal', district: 'Jumla', location: 'Thapribada', coordinates: '29.3837, 81.9787', site_type: 'Pillars', documentation: '5 pillars varied condition.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.89', country: 'Nepal', district: 'Jumla', location: 'Ludku', coordinates: '29.4037, 82.0049', site_type: 'Pillar', documentation: 'Submerged in canal.', visit_date: '2025-02-07' },
    { entry_no: 'N.D.D.90', country: 'Nepal', district: 'Jumla', location: 'Ludku', coordinates: '29.4041, 82.0054', site_type: 'Pillar', documentation: 'Sun/moon, warrior on horse.', visit_date: '2025-02-08' },
    { entry_no: 'N.D.D.91', country: 'Nepal', district: 'Jumla', location: 'Hatsinja', coordinates: '29.4110, 82.0201', site_type: 'Pillars', documentation: 'Two pillars with stupa motif.', visit_date: '2025-02-08' },
    { entry_no: 'N.D.D.92', country: 'Nepal', district: 'Jumla', location: 'Kanakasundari', coordinates: '29.4092, 82.0245', site_type: 'Temple', documentation: 'Repurposed kritikhamba as door.', description: 'Khasa Palace remains in Sinja.', visit_date: '2025-02-08' },
    { entry_no: 'N.D.D.93', country: 'Nepal', district: 'Jumla', location: 'Saubada', coordinates: '29.4085, 82.0226', site_type: 'Remains', documentation: 'Deval ruins, amalaka to shivalinga.', visit_date: '2025-02-08' },
    { entry_no: 'N.D.D.94', country: 'Nepal', district: 'Jumla', location: 'Saubada', coordinates: '29.4081, 82.0228', site_type: 'Remains', documentation: 'Stone blocks, well-preserved lion.', visit_date: '2025-02-08' },
    { entry_no: 'N.D.D.95', country: 'Nepal', district: 'Jumla', location: 'Sera', coordinates: '29.4039, 82.0246', site_type: 'Stone Inscription', documentation: 'Sera inscription of Ripu Malla. Still legible.', visit_date: '2025-02-08' },
    { entry_no: 'N.D.D.96', country: 'Nepal', district: 'Mugu', location: 'Murma', coordinates: '29.5256, 82.0475', site_type: 'Pillar', documentation: 'Kham Gaite Pillar. 38x164x8.', visit_date: '2025-02-09' },
    { entry_no: 'N.D.D.97', country: 'Nepal', district: 'Mugu', location: 'Murma', coordinates: '29.5269, 82.0475', site_type: 'Temple', documentation: 'Mahadev Mandir, 10-15 years old.', visit_date: '2025-02-09' },
    { entry_no: 'N.D.D.98', country: 'Nepal', district: 'Mugu', location: 'Rara Tal', coordinates: '29.5372, 82.0752', site_type: 'Pillars', documentation: 'Two steles. Sun/moon motifs.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.99', country: 'Nepal', district: 'Mugu', location: 'Rara Tal', coordinates: '29.5451, 82.0939', site_type: 'Deval / Fountain', documentation: 'Classical fountain with intact tap.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.100', country: 'Nepal', district: 'Mugu', location: 'Rara Tal', coordinates: '29.5440, 82.0989', site_type: 'Steles', documentation: '3 steles with vishvavajra.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.101', country: 'Nepal', district: 'Mugu', location: 'Bham Bada', coordinates: '29.5399, 82.1573', site_type: 'Deval / Fountain', documentation: 'Deval buried, fountain by landslide.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.102', country: 'Nepal', district: 'Mugu', location: 'Ruga', coordinates: '29.5588, 82.1631', site_type: 'Temple', documentation: 'Rugā Maṣṭā Temple. Sun face motif.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.103', country: 'Nepal', district: 'Mugu', location: 'Ghata', coordinates: '29.5521, 82.1717', site_type: 'Stele / Pillars', documentation: 'First stele good, 5 more eroded.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.104', country: 'Nepal', district: 'Mugu', location: 'Ghamgadhi', coordinates: '29.5476, 82.1570', site_type: 'Temple / Pillar', documentation: 'Kālikā Mālikā. Pillar 30x107x15.', visit_date: '2025-02-10' },
    { entry_no: 'N.D.D.105', country: 'Nepal', district: 'Mugu', location: 'Bham Bada', coordinates: '29.5396, 82.1563', site_type: 'Stele', documentation: 'Kolikholā Pillar. Worshipped as Shiva.', visit_date: '2025-02-11' },
    { entry_no: 'N.D.D.106', country: 'Nepal', district: 'Mugu', location: 'Kos', coordinates: '29.5313, 82.1624', site_type: 'Pillar', documentation: 'Broken pillar. Beaded motif.', visit_date: '2025-02-11' },
    { entry_no: 'N.D.D.107', country: 'Nepal', district: 'Mugu', location: 'Kos', coordinates: '29.5313, 82.1624', site_type: 'Stone Inscription', documentation: 'Tablet mentioning Bikram Samvat. 25x46x3.', visit_date: '2025-02-11' }
];

async function insertData() {
    console.log(`Inserting ${sites.length} historical sites...`);

    const { data, error } = await supabase
        .from('historical_sites')
        .insert(sites);

    if (error) {
        console.error('Error inserting data:', error.message);
        return false;
    }

    console.log('Successfully inserted all sites!');
    return true;
}

// Run
insertData().then(success => {
    if (success) {
        console.log('Done! Check your Supabase dashboard.');
    } else {
        console.log('Failed. You may need to create the table first.');
    }
});
