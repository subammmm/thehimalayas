#!/usr/bin/env node
// Writes a static index.html for each route that matters into dist/, after `vite build`.
// Crawlers and link previews do not run the app, so every page gets its own <title>,
// description, canonical and Open Graph tags, plus a <noscript> summary of its content.
// The app itself is untouched: it still mounts with createRoot and renders as before.
// On Vercel, files on disk are served before the SPA rewrite in vercel.json applies.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = file => JSON.parse(readFileSync(join(root, file), 'utf8'));

export const escapeHtml = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Cut at a word boundary for meta descriptions.
export function truncate(text, max = 200) {
    if (text.length <= max) return text;
    return text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[\s,;:.]+$/, '') + '…';
}

// Fill the built index.html for one route. `body` is trusted HTML built from escaped values.
export function renderPage(template, siteUrl, { path, title, description, body, jsonLd, preconnect }) {
    const url = siteUrl + path;
    const set = (html, pattern, value) => {
        if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in dist/index.html`);
        return html.replace(pattern, (_, before, after) => before + escapeHtml(value) + after);
    };
    let html = template;
    html = set(html, /(<title>)[^<]*(<\/title>)/, title);
    html = set(html, /(<meta name="description" content=")[^"]*(")/, description);
    html = set(html, /(<link rel="canonical" href=")[^"]*(")/, url);
    html = set(html, /(<meta property="og:url" content=")[^"]*(")/, url);
    for (const key of ['property="og:title"', 'name="twitter:title"']) html = set(html, new RegExp(`(<meta ${key} content=")[^"]*(")`), title);
    for (const key of ['property="og:description"', 'name="twitter:description"']) html = set(html, new RegExp(`(<meta ${key} content=")[^"]*(")`), description);
    // Open the connection to the host this page fetches from first (hero image or map tiles)
    if (preconnect) html = html.replace('</head>', () => `  <link rel="preconnect" href="${escapeHtml(preconnect)}" crossorigin />\n  </head>`);
    if (jsonLd) {
        // "<" is escaped so no text in the data can close the script element
        html = html.replace('</head>', () => `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n  </head>`);
    }
    if (!html.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> not found in dist/index.html');
    return html.replace('<div id="root"></div>', () => `<div id="root"></div>\n    <noscript>\n${body}\n    </noscript>`);
}

export function sitePage(site, project) {
    const where = [site.district !== 'N/A' && site.district, site.country].filter(Boolean).join(', ');
    const text = site.description ?? site.documentation ?? '';
    const row = (label, value) => value == null || value === '' ? '' : `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`;
    return {
        path: `/locations/${site.id}`,
        title: `${site.location} (${site.entry_no}) | ${project.siteName}`,
        description: truncate(`${site.site_type} at ${site.location}, ${where} (${site.entry_no}). ${text}`.trim()),
        body: `<main><h1>${escapeHtml(site.location)}</h1><dl>${[
            row('Entry', site.entry_no), row('Type', site.site_type), row('District', site.district), row('Country', site.country),
            row('Coordinates', site.latitude == null ? 'Not recorded' : `${site.latitude}, ${site.longitude}`),
            row('Visited', site.visit_date), row('Description', site.description), row('Field documentation', site.documentation),
            row('Source', site.source), row('Possibly related to', site.possibly_related.join(', ')),
        ].join('')}</dl><p><a href="/browse">All sites</a> · <a href="/data">Data and citation</a></p></main>`,
    };
}

export function pages(sites, project) {
    const mapped = sites.filter(s => s.latitude != null).length;
    const title = name => `${name} | ${project.siteName}`;
    const links = '<p><a href="/browse">Browse all sites</a> · <a href="/map">Map</a> · <a href="/atlas">Atlas</a> · <a href="/data">Data</a> · <a href="/about">About</a></p>';
    const count = values => Object.entries(values.reduce((counts, v) => ({ ...counts, [v]: (counts[v] ?? 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1]).map(([name, n]) => `<li>${escapeHtml(name)}: ${n}</li>`).join('');
    const summary = `${sites.length} Khasa Malla historical sites, ${mapped} with coordinates.`;
    const files = [['sites.geojson', 'application/geo+json'], ['sites.csv', 'text/csv'], ['sites.json', 'application/json']];
    return [
        {
            path: '/', preconnect: 'https://images.unsplash.com',
            title: `${project.siteName}: a digital atlas of Khasa Malla historical sites`,
            description: `A digital atlas of ${sites.length} Khasa Malla (12th to 14th century) historical sites across western Nepal, India and Tibet: pillars, steles, devals, temples and inscriptions, with an interactive map and open data.`,
            body: `<main><h1>${escapeHtml(project.siteName)}</h1><p>${escapeHtml(project.datasetDescription)} ${summary}</p>${links}</main>`,
        },
        {
            path: '/map', title: title('Map'), preconnect: 'https://api.mapbox.com',
            description: `Interactive map of the ${mapped} Khasa Malla historical sites with recorded coordinates, with search and filters by type and district.`,
            body: `<main><h1>Map</h1><p>The map needs JavaScript. Every site is also listed on the <a href="/browse">Browse</a> page.</p></main>`,
        },
        {
            path: '/browse', title: title('Browse'),
            description: `All ${sites.length} Khasa Malla historical sites as a list, grouped by district or by type, including those without coordinates.`,
            body: `<main><h1>Browse</h1><ul>${sites.map(s => `<li><a href="/locations/${s.id}">${escapeHtml(s.location)}</a> (${escapeHtml(`${s.entry_no}, ${s.site_type}, ${s.district}`)})</li>`).join('')}</ul></main>`,
        },
        {
            path: '/atlas', title: title('Atlas'),
            description: `Statistics for the ${sites.length} Khasa Malla historical sites in the atlas: counts by district, by type and by research phase.`,
            body: `<main><h1>Atlas</h1><p>${summary}</p><h2>By district</h2><ul>${count(sites.map(s => s.district))}</ul><h2>By type</h2><ul>${count(sites.flatMap(s => s.site_categories))}</ul></main>`,
        },
        {
            path: '/data', title: title('Data'),
            description: `Download the dataset behind the atlas: ${summary} GeoJSON, CSV and JSON, with a data dictionary and a suggested citation.`,
            body: `<main><h1>Data</h1><p>${summary}</p><ul>${files.map(([file]) => `<li><a href="/data/${file}">${file}</a></li>`).join('')}<li><a href="/data/datapackage.json">datapackage.json</a></li></ul><p>Author: ${escapeHtml(project.author)}. Licence: ${escapeHtml(project.licence)}.</p></main>`,
            jsonLd: {
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                name: project.datasetTitle,
                description: `${project.datasetDescription} ${summary}`,
                url: `${project.siteUrl}/data`,
                creator: { '@type': 'Organization', name: project.author },
                // A licence is added once project.json names one (licenceSpdx); none is claimed before that.
                ...(project.licenceSpdx ? { license: `https://spdx.org/licenses/${project.licenceSpdx}.html` } : {}),
                isAccessibleForFree: true,
                keywords: ['Khasa Malla', 'Nepal', 'Karnali', 'archaeology', 'epigraphy', 'cultural heritage'],
                spatialCoverage: { '@type': 'Place', name: 'Western Nepal, with records in India and Tibet' },
                distribution: files.map(([file, encodingFormat]) => ({ '@type': 'DataDownload', encodingFormat, contentUrl: `${project.siteUrl}/data/${file}` })),
            },
        },
        {
            path: '/about', title: title('About'), preconnect: 'https://images.unsplash.com',
            description: `About ${project.siteName}, a digital atlas of historical sites of the Khasa Malla kingdom (12th to 14th century) across western Nepal, India and Tibet.`,
            body: `<main><h1>About</h1><p>${escapeHtml(project.datasetDescription)} ${summary}</p>${links}</main>`,
        },
        ...sites.map(site => sitePage(site, project)),
    ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const project = readJson('src/data/project.json');
    const template = readFileSync(join(root, 'dist/index.html'), 'utf8');
    if (template.includes('<noscript>')) throw new Error('prerender: dist/index.html is already prerendered; run vite build first');
    const all = pages(readJson('public/data/sites.json'), project);
    for (const page of all) {
        const file = join(root, 'dist', page.path, 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, renderPage(template, project.siteUrl, page));
    }
    console.log(`prerendered ${all.length} pages into dist/`);
}
