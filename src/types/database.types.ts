export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            historical_sites: {
                Row: {
                    id: string;
                    entry_no: string | null;
                    country: string;
                    district: string | null;
                    location: string;
                    coordinates: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    site_type: string;
                    // Derived by scripts/build-sites-json.py; absent from the database table.
                    site_categories?: string[];
                    possibly_related?: string[];
                    images?: { src: string; alt: string; credit: string; licence: string }[];
                    documentation: string | null;
                    description: string | null;
                    visit_date: string | null;
                    phase: number | null;
                    language: string | null;
                    translation: string | null;
                    source: string | null;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    entry_no?: string | null;
                    country?: string;
                    district?: string | null;
                    location: string;
                    coordinates?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    site_type: string;
                    documentation?: string | null;
                    description?: string | null;
                    visit_date?: string | null;
                    phase?: number | null;
                    language?: string | null;
                    translation?: string | null;
                    source?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    entry_no?: string | null;
                    country?: string;
                    district?: string | null;
                    location?: string;
                    coordinates?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    site_type?: string;
                    documentation?: string | null;
                    description?: string | null;
                    visit_date?: string | null;
                    phase?: number | null;
                    language?: string | null;
                    translation?: string | null;
                    source?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Helper type for Historical Site from database
export type DbHistoricalSite = Database['public']['Tables']['historical_sites']['Row'];
