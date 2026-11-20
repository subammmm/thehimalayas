import { Download } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { useLocations } from '../hooks/useLocations';

// Files written to public/data/ by scripts/build-sites-json.py
const DOWNLOADS = [
    ['sites.geojson', 'GeoJSON', 'FeatureCollection, one feature per site. Sites without coordinates have a null geometry.'],
    ['sites.csv', 'CSV', 'One row per site, UTF-8, with a header row.'],
    ['sites.json', 'JSON', 'An array of site records with the same fields as the CSV.'],
];

const FIELDS = [
    ['id', 'Identifier used in this atlas and its URLs, for example site-12.'],
    ['entry_no', 'Entry number in the project documentation, for example N.D.D.12.'],
    ['country', 'Present-day country.'],
    ['district', 'District or region. "N/A" where the record gives none.'],
    ['location', 'Place name as recorded.'],
    ['coordinates', 'Coordinates as recorded, in decimal degrees or degrees, minutes and seconds. Empty where none were recorded.'],
    ['latitude, longitude', 'Decimal degrees parsed from coordinates and rounded to six places. Empty where there are no coordinates. In GeoJSON these form the point geometry, in [longitude, latitude] order.'],
    ['site_type', 'Type of site or object as recorded.'],
    ['site_categories', 'Normalised categories derived from site_type for filtering, so that "Pillar" and "Pillars" group together. A site can have several. Separated by "; " in the CSV.'],
    ['documentation', 'Field notes: condition, measurements and observations.'],
    ['description', 'Historical or descriptive note.'],
    ['visit_date', 'Date of the site visit (YYYY-MM-DD). This is not the date of the monument.'],
    ['phase', 'Research phase number.'],
    ['language, translation', 'Language and translation of an inscription. Empty for every record at present.'],
    ['source', 'The source the record draws on, as given in the documentation.'],
];

const DataPage = () => {
    const { locations } = useLocations();
    const mapped = locations.filter(site => site.coordinates).length;
    const accessed = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <PageShell title="Data">
            <p className="text-lg text-white/70 max-w-3xl mb-10">
                The full dataset behind this atlas: {locations.length} Khasa Malla historical sites,
                {' '}{mapped} with coordinates and {locations.length - mapped} without.
            </p>

            <section aria-labelledby="downloads" className="mb-12">
                <h2 id="downloads" className="text-2xl font-bold mb-4">Downloads</h2>
                <ul className="grid gap-4 md:grid-cols-3">
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
            </section>

            <section aria-labelledby="licence" className="mb-12">
                <h2 id="licence" className="text-2xl font-bold mb-4">Licence</h2>
                {/* TODO(owner): choose a licence for the dataset and replace this line. */}
                <p className="text-white/80">Licence: to be confirmed by the author.</p>
            </section>

            <section aria-labelledby="citation" className="mb-12">
                <h2 id="citation" className="text-2xl font-bold mb-4">Suggested citation</h2>
                <p className="bg-white/5 border border-white/10 rounded-2xl p-5 font-mono text-sm text-white/80 select-all break-words">
                    The Himalayas Project. Khasa Malla historical sites [data set]. https://thehimalayas.vercel.app/data (accessed {accessed}).
                </p>
            </section>

            <section aria-labelledby="dictionary" className="mb-12">
                <h2 id="dictionary" className="text-2xl font-bold mb-4">Data dictionary</h2>
                <dl className="divide-y divide-white/10 border-y border-white/10">
                    {FIELDS.map(([name, meaning]) => (
                        <div key={name} className="py-3 md:grid md:grid-cols-4 md:gap-6">
                            <dt className="font-mono text-sm text-amber-400">{name}</dt>
                            <dd className="text-white/80 md:col-span-3">{meaning}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section aria-labelledby="notes">
                <h2 id="notes" className="text-2xl font-bold mb-4">Notes on the data</h2>
                <ul className="list-disc pl-5 space-y-2 text-white/80 max-w-3xl">
                    <li>Records are transcribed from the project documentation. Descriptions and sources are published as recorded.</li>
                    <li>The monuments are not individually dated in the dataset, so the atlas does not offer a timeline.</li>
                    <li>Two pairs of records share the same coordinates (N.D.D.120 and N.D.D.125; N.D.D.126 and N.D.D.127). The map draws them about 30 m apart so both can be selected; the data files keep the recorded values.</li>
                    <li>The datum of the recorded coordinates is not stated in the documentation; WGS 84 is assumed.</li>
                </ul>
            </section>
        </PageShell>
    );
};

export default DataPage;
