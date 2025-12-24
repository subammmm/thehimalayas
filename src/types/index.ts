// Site types for Khasa Malla historical/archaeological sites
export type SiteType =
    | 'Stele'
    | 'Pillar'
    | 'Pillars'
    | 'Deval'
    | 'Deval (Panchadeval)'
    | 'Stupa'
    | 'Stupas / Stele'
    | 'Stupa / Pillar'
    | 'Stupa / Fountain'
    | 'Steles'
    | 'Steles / Pillar'
    | 'Stele / Pillar'
    | 'Stele / Pillars'
    | 'Temple'
    | 'Temple Complex'
    | 'Temple / Pillar'
    | 'Temple / Pillars / Remains'
    | 'Temple / Stone Inscription'
    | 'Temple / Epigraph'
    | 'Temple / Sculpture'
    | 'Fountain'
    | 'Fountain / Stele'
    | 'Deval / Fountain'
    | 'Deval / Fountain / Pillars'
    | 'Fort'
    | 'Fort Ruins'
    | 'Palace Ruins'
    | 'Inscription'
    | 'Inscription on Reservoir'
    | 'Stone Inscription'
    | 'Copperplate Inscription'
    | 'Temple Inscription'
    | 'Copper Plate'
    | 'Gold Plate'
    | 'Monastery'
    | 'Vihara'
    | 'Remains'
    | 'Museum'
    | 'Pavilion'
    | 'Carved Stone'
    | 'Stone Sculptures'
    | 'Mounds'
    | 'Water Receptacle'
    | 'Seat of Power'
    | 'Resthouse / Museum';

// Districts where Khasa Malla sites are located
export type District =
    | 'Dailekh'
    | 'Jumla'
    | 'Surkhet'
    | 'Mugu'
    | 'Kalikot'
    | 'Achham'
    | 'Bajhang'
    | 'Kaski'
    | 'Bihar'
    | 'Uttarakhand'
    | 'Tibet'
    | 'N/A';

export interface Coordinates {
    lat: number;
    lng: number;
}

// Historical site from Khasa Malla research
// Includes all fields from the database plus compatibility properties
export interface HistoricalSite {
    id: string;
    entry_no: string;
    country: string;
    district: District | string;
    location: string;
    coordinates: Coordinates | null;
    site_type: SiteType | string;
    documentation: string | null;
    description: string | null;
    visit_date: string | null;
    phase: number | null;
    language: string | null;
    translation: string | null;
    source: string | null;
    created_at: string;

    // Compatibility aliases for map components
    name: string;           // Alias for location
    type: SiteType | string; // Alias for site_type
    region: District | string; // Alias for district
    elevation: number;      // Default 0 for historical sites
}

// Backward compatibility
export type Location = HistoricalSite;
export type LocationType = SiteType | string;
export type Region = District;
