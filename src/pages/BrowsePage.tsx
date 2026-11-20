import { Link, useSearchParams } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { useLocations } from '../hooks/useLocations';
import { countBy, mapUrl } from '../lib/sites';

// Every site as a plain list, grouped by district or by type. ?by=type selects the grouping.
const BrowsePage = () => {
    const { locations } = useLocations();
    const [params, setParams] = useSearchParams();
    const byType = params.get('by') === 'type';

    const groups = countBy(locations, site => byType ? site.categories : [site.region]);

    return (
        <PageShell title="Browse">
            <p className="text-lg text-white/70 max-w-3xl mb-6">
                All {locations.length} sites, including those without coordinates.
                {byType && ' A site with several features is listed under each type.'}
            </p>

            <div role="group" aria-label="Group by" className="inline-flex rounded-full border border-white/20 p-1 mb-6">
                {[['district', 'By district'], ['type', 'By type']].map(([by, label]) => (
                    <button
                        key={by}
                        onClick={() => setParams(by === 'type' ? { by } : {}, { replace: true })}
                        aria-pressed={byType === (by === 'type')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${byType === (by === 'type') ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <nav aria-label="Groups" className="flex flex-wrap gap-2 mb-10">
                {groups.map(([group, count]) => (
                    <a key={group} href={`#${encodeURIComponent(group)}`} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10">
                        {group} <span className="text-white/50">{count}</span>
                    </a>
                ))}
            </nav>

            {groups.map(([group, count]) => (
                <section key={group} id={encodeURIComponent(group)} aria-label={group} className="mb-10 scroll-mt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                        <h2 className="text-2xl font-bold">{group} <span className="text-base font-normal text-white/50">{count}</span></h2>
                        <Link to={mapUrl(byType ? { types: [group] } : { districts: [group] })} className="text-sm text-amber-400 hover:text-amber-300">
                            Show on map
                        </Link>
                    </div>
                    <ul className="grid md:grid-cols-2 gap-x-8">
                        {locations.filter(site => byType ? site.categories.includes(group) : site.region === group).map(site => (
                            <li key={site.id}>
                                <Link to={`/locations/${site.id}`} className="block py-2 hover:bg-white/5 rounded-lg px-2 -mx-2">
                                    <span className="font-medium">{site.name}</span>
                                    <span className="block text-sm text-white/60">
                                        {site.entry_no} · {byType ? site.region : site.type}{site.coordinates ? '' : ' · no coordinates'}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </PageShell>
    );
};

export default BrowsePage;
