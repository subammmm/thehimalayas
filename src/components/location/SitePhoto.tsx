import { Castle, Droplets, Landmark, RectangleVertical, ScrollText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HistoricalSite } from '../../types';
import { siteColor } from '../../lib/sites';

const ICONS: Record<string, LucideIcon> = {
    Inscription: ScrollText,
    Pillar: RectangleVertical,
    Stele: RectangleVertical,
    Fountain: Droplets,
    'Fort / Palace': Castle,
};

// Header background for a site: its first photograph, or, while none is published, a plain
// panel in the colour of the site's map marker. Never a stand-in picture of somewhere else.
// `noteClassName` places the no-photograph note clear of whatever the caller overlays.
export const SitePhoto = ({ site, noteClassName = 'pt-5' }: { site: HistoricalSite; noteClassName?: string }) => {
    const image = site.images[0];
    if (image) {
        return (
            <figure className="absolute inset-0">
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                <figcaption className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/50 text-[11px] text-white/90 whitespace-nowrap">
                    {image.credit} · {image.licence}
                </figcaption>
            </figure>
        );
    }
    const color = siteColor(site);
    const Icon = ICONS[site.categories[0]] ?? Landmark;
    return (
        <div
            className={`absolute inset-0 flex flex-col items-center gap-1.5 bg-neutral-950 ${noteClassName}`}
            style={{ backgroundImage: `linear-gradient(135deg, ${color}73, transparent 70%)` }}
        >
            <Icon className="w-9 h-9" style={{ color }} aria-hidden="true" />
            <p className="text-xs text-white/70">No photograph published yet</p>
        </div>
    );
};
