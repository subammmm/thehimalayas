import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { useLocations } from '../hooks/useLocations';
import { countBy, mapUrl } from '../lib/sites';
import { datasetCitation, datumLabel } from '../lib/citation';
import project from '../data/project.json';
import type { HistoricalSite } from '../types';

// Files written to public/data/ by scripts/build-sites-json.py
const DOWNLOADS = [
    ['sites.geojson', 'GeoJSON', 'FeatureCollection, one feature per site. Sites without coordinates have a null geometry.'],
    ['sites.csv', 'CSV', 'One row per site, UTF-8, with a header row.'],
    ['sites.json', 'JSON', 'An array of site records with the same fields as the CSV.'],
    ['datapackage.json', 'Data package', 'Frictionless Data descriptor: the files above and the type of every CSV column.'],
];

// Read-only map for other websites; the page behind it is EmbedPage.
const EmbedCode = ({ locations }: { locations: HistoricalSite[] }) => {
    const [district, setDistrict] = useState('');
    const [type, setType] = useState('');
    const [copied, setCopied] = useState(false);
    const path = mapUrl({ districts: district ? [district] : [], types: type ? [type] : [] }).replace('/map', '/embed');
    const code = `<iframe src="${project.siteUrl}${path.replace(/&/g, '&amp;')}" title="${project.datasetTitle}: map" width="100%" height="480" style="border:0" loading="lazy"></iframe>`;
    const select = (label: string, value: string, onChange: (value: string) => void, options: [string, number][]) => (
        <label className="text-sm text-white/70">
            {label}{' '}
            <select value={value} onChange={e => onChange(e.target.value)} className="ml-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white">
                <option value="" className="text-black">All</option>
                {options.map(([option, count]) => <option key={option} value={option} className="text-black">{option} ({count})</option>)}
            </select>
        </label>
    );
    const mapped = locations.filter(site => site.coordinates);

    return (
        <section aria-labelledby="embed" className="mb-12">
            <h2 id="embed" className="text-2xl font-bold mb-4">Embed the map</h2>
            <p className="text-white/80 max-w-3xl mb-4">
                A read-only map of the sites with coordinates, for use on another website. It carries a credit and a link back to this atlas.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                {select('District', district, setDistrict, countBy(mapped, site => [site.region]))}
                {select('Type', type, setType, countBy(mapped, site => site.categories))}
            </div>
            <p className="bg-white/5 border border-white/10 rounded-2xl p-5 font-mono text-sm text-white/80 select-all break-all">{code}</p>
            <button
                onClick={async () => {
                    await navigator.clipboard.writeText(code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span aria-live="polite">{copied ? 'Copied' : 'Copy embed code'}</span>
            </button>
        </section>
    );
};

const DataPage = () => {
    const { locations } = useLocations();
    const mapped = locations.filter(site => site.coordinates).length;

    return (
        <PageShell title="Data">
            <p className="text-lg text-white/70 max-w-3xl mb-10">
                The full dataset behind this atlas: {locations.length} Khasa Malla historical sites,
                {' '}{mapped} with coordinates and {locations.length - mapped} without.
            </p>

            <section aria-labelledby="downloads" className="mb-12">
                <h2 id="downloads" className="text-2xl font-bold mb-4">Downloads</h2>
                <ul className="grid gap-4 md:grid-cols-2">
                    {DOWNLOADS.map(([file, label, note]) => (
                        <li key={file} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                            <a href={`/data/${file}`} download className="inline-flex items-center gap-2 font-semibold text-amber-400 hover:text-amber-300">
                                <Download className="w-4 h-4" aria-hidden="true" />
                                {label} <span className="font-mono text-sm font-normal">({file})</span>
                            </a>
                            <p className="text-sm text-white/60 mt-2">{note}</p>
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-white/60 mt-4 max-w-3xl">
                    For Wikimedia projects, the repository holds draft exports for manual review (a Wikidata QuickStatements batch and
                    a Commons description sheet): <a href={`${project.repository}/tree/main/exports`} className="text-amber-400 hover:text-amber-300 underline">exports/</a>.
                    Nothing is uploaded automatically.
                </p>
            </section>

            <section aria-labelledby="licence" className="mb-12">
                <h2 id="licence" className="text-2xl font-bold mb-4">Author, licence and datum</h2>
                {/* The values and their TODO notes live in src/data/project.json. */}
                <dl className="text-white/80 space-y-1">
                    <div><dt className="inline text-white/60">Author: </dt><dd className="inline">{project.author}</dd></div>
                    <div><dt className="inline text-white/60">Licence: </dt><dd className="inline">{project.licence}</dd></div>
                    <div><dt className="inline text-white/60">Coordinate datum: </dt><dd className="inline">{datumLabel}</dd></div>
                </dl>
                <p className="text-sm text-white/60 mt-3 max-w-3xl">
                    These three entries are provisional until the author confirms them. Until a licence is named, please ask before reusing the data.
                </p>
            </section>

            <section aria-labelledby="citation" className="mb-12">
                <h2 id="citation" className="text-2xl font-bold mb-4">Suggested citation</h2>
                <p className="bg-white/5 border border-white/10 rounded-2xl p-5 font-mono text-sm text-white/80 select-all break-words">
                    {datasetCitation()}
                </p>
                <p className="text-sm text-white/60 mt-3">
                    Machine-readable: <a href={`${project.repository}/blob/main/CITATION.cff`} className="text-amber-400 hover:text-amber-300 underline">CITATION.cff</a> in the repository.
                </p>
            </section>

            <EmbedCode locations={locations} />

            <section aria-labelledby="dictionary" className="mb-12">
                <h2 id="dictionary" className="text-2xl font-bold mb-4">Data dictionary</h2>
                <dl className="divide-y divide-white/10 border-y border-white/10">
                    {project.fields.map(({ name, description }) => (
                        <div key={name} className="py-3 md:grid md:grid-cols-4 md:gap-6">
                            <dt className="font-mono text-sm text-amber-400">{name}</dt>
                            <dd className="text-white/80 md:col-span-3">{description}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section aria-labelledby="notes">
                <h2 id="notes" className="text-2xl font-bold mb-4">Notes on the data</h2>
                <ul className="list-disc pl-5 space-y-2 text-white/80 max-w-3xl">
                    <li>Records are transcribed from the project documentation. Descriptions and sources are published as recorded.</li>
                    <li>The monuments are not individually dated in the dataset, so the atlas does not offer a timeline.</li>
                    <li>Two pairs of records share the same coordinates (N.D.D.120 and N.D.D.125; N.D.D.126 and N.D.D.127). Each record carries a "possibly related" cross-reference to the other; none are merged. The map draws them about 30 m apart so both can be selected; the data files keep the recorded values.</li>
                    <li>No photographs of the sites have been published yet, so the atlas shows none.</li>
                    <li>Coordinate datum: {datumLabel}.</li>
                </ul>
            </section>
        </PageShell>
    );
};

export default DataPage;
