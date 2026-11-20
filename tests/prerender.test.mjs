import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pages, renderPage, sitePage, truncate } from '../scripts/prerender.mjs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const project = JSON.parse(read('src/data/project.json'));
const sites = JSON.parse(read('public/data/sites.json'));
const template = read('index.html'); // the source template carries the same tags as dist/index.html

test('a site page carries its own title, canonical, description and record', () => {
    const site = sites.find(s => s.id === 'site-42');
    const html = renderPage(template, project.siteUrl, sitePage(site, project));
    assert.match(html, /<title>Dullu \(N\.D\.D\.42\) \| The Himalayas<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/thehimalayas\.vercel\.app\/locations\/site-42"/);
    assert.match(html, /<meta property="og:title" content="Dullu \(N\.D\.D\.42\) \| The Himalayas"/);
    assert.match(html, /<meta name="description" content="Pillar at Dullu, Dailekh, Nepal \(N\.D\.D\.42\)\. Pillar with normal design on capital\./);
    assert.ok(html.includes('<noscript>') && html.includes(site.documentation));
    assert.ok(html.includes('<div id="root"></div>'), 'the app still mounts into an empty root');
});

test('text from the records is escaped in tags and in the summary', () => {
    const site = { ...sites[0], location: 'A "quoted" <b>name</b> & more', description: '</noscript><script>alert(1)</script>' };
    const html = renderPage(template, project.siteUrl, sitePage(site, project));
    assert.ok(!html.includes('<script>alert(1)'));
    assert.ok(!html.includes('<b>name</b>'));
    assert.ok(html.includes('A &quot;quoted&quot; &lt;b&gt;name&lt;/b&gt; &amp; more'));
});

test('every prerendered page has a unique path and title, and a description that fits a preview', () => {
    const all = pages(sites, project);
    assert.equal(all.length, 6 + 127);
    assert.equal(new Set(all.map(p => p.path)).size, all.length);
    assert.equal(new Set(all.map(p => p.title)).size, all.length);
    for (const page of all) assert.ok(page.description.length > 20 && page.description.length <= 300, page.path);
});

test('the data page carries schema.org Dataset JSON-LD without claiming a licence', () => {
    const html = renderPage(template, project.siteUrl, pages(sites, project).find(p => p.path === '/data'));
    const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(jsonLd['@type'], 'Dataset');
    assert.equal(jsonLd.distribution.length, 3);
    assert.equal('license' in jsonLd, project.licenceSpdx !== null);
});

test('renderPage fails loudly when a tag it fills is missing from the template', () => {
    assert.throws(() => renderPage('<html><head></head><body></body></html>', project.siteUrl, pages(sites, project)[0]), /not found/);
});

test('truncate cuts at a word boundary', () => {
    assert.equal(truncate('short'), 'short');
    assert.equal(truncate('one two three four', 12), 'one two…');
});
