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

// A photograph of a site. None are published yet; see IMAGES in scripts/build-sites-json.py.
export interface SiteImage {
    src: string;
    alt: string;
    credit: string;
    licence: string;
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
    // Normalised categories used for filtering and browsing; site_type keeps the recorded text.
    categories: string[];
    // Entry numbers of records that may describe the same site (editorial cross-reference).
    possibly_related: string[];
    images: SiteImage[];
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
}

// Backward compatibility
export type Location = HistoricalSite;
export type LocationType = SiteType | string;
export type Region = District;
