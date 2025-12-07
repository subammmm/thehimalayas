export type LocationType =
    | 'Peak'
    | 'Valley'
    | 'Lake'
    | 'Monastery'
    | 'Village'
    | 'Route/Trek'
    | 'Glacier'
    | 'Basecamp';

export type Region =
    | 'Everest'
    | 'Annapurna'
    | 'Langtang'
    | 'Manaslu'
    | 'Kanchenjunga'
    | 'Makalu'
    | 'Dolpo'
    | 'Mustang';

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    region: Region;
    coordinates: Coordinates;
    elevation: number; // in meters
    description: string;
    images: string[];
    tags: string[];
    relatedLocations: string[]; // IDs of related locations
}
