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
                    site_type: string;
                    documentation: string | null;
                    description: string | null;
                    visit_date: string | null;
                    phase: number | null;
                    source: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    entry_no?: string | null;
                    country?: string;
                    district?: string | null;
                    location: string;
                    coordinates?: string | null;
                    site_type: string;
                    documentation?: string | null;
                    description?: string | null;
                    visit_date?: string | null;
                    phase?: number | null;
                    source?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    entry_no?: string | null;
                    country?: string;
                    district?: string | null;
                    location?: string;
                    coordinates?: string | null;
                    site_type?: string;
                    documentation?: string | null;
                    description?: string | null;
                    visit_date?: string | null;
                    phase?: number | null;
                    source?: string | null;
                    created_at?: string;
                };
            };
            // Keep old locations type for reference but mark as deprecated
            locations: {
                Row: {
                    id: string;
                    name: string;
                    type: string;
                    region: string;
                    latitude: number;
                    longitude: number;
                    elevation: number;
                    description: string | null;
                    images: string[];
                    tags: string[];
                    related_location_ids: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: object;
                Update: object;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Helper type for Historical Site from database
export type DbHistoricalSite = Database['public']['Tables']['historical_sites']['Row'];

// Deprecated - use DbHistoricalSite
export type DbLocation = Database['public']['Tables']['locations']['Row'];
