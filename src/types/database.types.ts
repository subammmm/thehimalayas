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
                Insert: {
                    id?: string;
                    name: string;
                    type: string;
                    region: string;
                    latitude: number;
                    longitude: number;
                    elevation: number;
                    description?: string | null;
                    images?: string[];
                    tags?: string[];
                    related_location_ids?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    type?: string;
                    region?: string;
                    latitude?: number;
                    longitude?: number;
                    elevation?: number;
                    description?: string | null;
                    images?: string[];
                    tags?: string[];
                    related_location_ids?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Helper type for Location from database
export type DbLocation = Database['public']['Tables']['locations']['Row'];
