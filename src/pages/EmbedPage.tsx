import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapboxCanvas } from '../components/map/MapboxCanvas';
import { useLocations } from '../hooks/useLocations';
import { usePageTitle } from '../hooks/usePageTitle';
import { mapUrl, matchesFilters, parseMapParams } from '../lib/sites';
import project from '../data/project.json';
import type { Location } from '../types';

// Read-only map for an <iframe> on another website: /embed?district=…&type=… (same
// parameters as /map). Links open the atlas in a new tab; the embed code is on /data.
const EmbedPage = () => {
    usePageTitle('Map embed');
    const { search } = useLocation();
    const { locations } = useLocations();
    // Memoised: a new array would make MapboxCanvas rebuild every marker on each selection
    const filters = useMemo(() => parseMapParams(search), [search]);
    const sites = useMemo(() => locations.filter(site => site.coordinates && matchesFilters(site, filters)), [locations, filters]);
    const [selected, setSelected] = useState<Location | null>(null);

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-white">
            <MapboxCanvas
                locations={sites}
                onLocationSelect={setSelected}
                focusedLocation={null}
                fallbackHint="Open the atlas for the list of sites."
            />
            <p className="absolute top-2 left-2 right-14 glass-overlay rounded-lg px-3 py-2 text-xs text-gray-800 flex flex-wrap justify-between gap-x-4 gap-y-1">
                {selected ? (
                    <a href={`/locations/${selected.id}`} target="_blank" rel="noopener" className="font-semibold underline">
                        {selected.name} · {selected.entry_no} · {selected.type}
                    </a>
                ) : (
                    <span>{sites.length} {sites.length === 1 ? 'site' : 'sites'} · select a marker for its record</span>
                )}
                <a href={mapUrl(filters)} target="_blank" rel="noopener" className="underline">
                    {project.datasetTitle}, {project.siteName} atlas
                </a>
            </p>
        </div>
    );
};

export default EmbedPage;
