import project from '../data/project.json';
import type { HistoricalSite } from '../types';

// Author, licence and datum come from src/data/project.json, where the placeholders are marked TODO.
export const datumLabel = project.datumConfirmed
    ? project.datum
    : `${project.datum} assumed (the documentation does not state the datum)`;

const longDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function datasetCitation(date = new Date()): string {
    return `${project.author}. ${project.datasetTitle} [data set]. ${project.siteUrl}/data (accessed ${longDate(date)}).`;
}

export function siteCitation(site: HistoricalSite, date = new Date()): string {
    return `${project.author}. (${date.getFullYear()}). ${site.name} (${site.entry_no}), ${site.region}. In ${project.datasetTitle} [data set]. Retrieved ${longDate(date)}, from ${project.siteUrl}/locations/${site.id}`;
}

export function siteBibtex(site: HistoricalSite, date = new Date()): string {
    return `@misc{himalayas_${site.id},
  title = {${site.name} (${site.entry_no}), ${site.region}},
  author = {{${project.author}}},
  year = {${date.getFullYear()}},
  url = {${project.siteUrl}/locations/${site.id}},
  note = {Accessed: ${longDate(date)}}
}`;
}
