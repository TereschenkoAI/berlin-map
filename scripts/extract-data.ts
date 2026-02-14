/**
 * Extracts place data from BERLIN_AKTIVITAETEN.md and outputs src/data/places.ts
 * Run with: npx tsx scripts/extract-data.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, '..');
const MD_PATH = join(DATA_DIR, 'BERLIN_AKTIVITAETEN.md');
const COORDS_PATH = join(DATA_DIR, 'coordinates.json');
const OUTPUT_PATH = join(ROOT, 'src', 'data', 'places.ts');

// Category mapping from markdown section headings
const SECTION_TO_CATEGORY: Record<string, string> = {
  'Cafes & Baeckereien': 'Cafes & Baeckereien',
  'Asiatische Restaurants': 'Asiatische Restaurants',
  'Asia-Supermaerkte & Shops': 'Asia-Supermaerkte & Shops',
  'Europaeische & Deutsche Restaurants': 'Europaeische & Deutsche Restaurants',
  'Internationale Restaurants': 'Internationale Restaurants',
  'Spas, Saunas & Thermen': 'Spas, Saunas & Thermen',
  'Eislaufen & Winter-Aktivitaeten': 'Eislaufen & Winter',
  'Weihnachtsmaerkte & Valentinstag-Events': 'Weihnachtsmaerkte & Valentinstag',
  'Outdoor & Natur in Berlin': 'Outdoor & Natur',
  'Tagesausfluege & Brandenburg': 'Tagesausfluege & Brandenburg',
  'Museen, Kultur & Entertainment': 'Museen, Kultur & Entertainment',
  'Bars, Shopping, Services & Sonstiges': 'Bars, Shopping & Sonstiges',
};

interface RawPlace {
  name: string;
  categoryGroup: string;
  address: string;
  lat: number | null;
  lng: number | null;
  stadtteil: string;
  season: string;
  preis: string;
  instagram: { label: string; url: string }[];
  besonderheit: string;
  oeffnungszeiten: string | null;
  beschreibung: string | null;
  isExpired: boolean;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äae]/g, (m) => (m === 'ä' ? 'ae' : m))
    .replace(/[öoe]/g, (m) => (m === 'ö' ? 'oe' : m))
    .replace(/[üue]/g, (m) => (m === 'ü' ? 'ue' : m))
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseInstagramLinks(cell: string): { label: string; url: string }[] {
  const links: { label: string; url: string }[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(cell)) !== null) {
    links.push({ label: match[1], url: match[2] });
  }
  return links;
}

function parsePrice(preis: string): { min: number | null; max: number | null } {
  const nums: number[] = [];
  const regex = /(\d+(?:[.,]\d+)?)/g;
  let match;
  while ((match = regex.exec(preis)) !== null) {
    nums.push(parseFloat(match[1].replace(',', '.')));
  }
  if (nums.length === 0) return { min: null, max: null };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function parseLat(val: string): number | null {
  const trimmed = val.trim();
  if (trimmed === '—' || trimmed === '-' || trimmed === '' || trimmed === 'N/A') return null;
  const n = parseFloat(trimmed);
  return isNaN(n) ? null : n;
}

function parseTableRow(cells: string[], headers: string[], currentCategory: string): RawPlace | null {
  if (cells.length < 7) return null;

  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => { headerMap[h.trim().toLowerCase()] = i; });

  const getName = () => cells[headerMap['name']]?.trim() || '';
  const getAddress = () => cells[headerMap['adresse']]?.trim() || '';
  const getLat = () => parseLat(cells[headerMap['lat']] || '');
  const getLng = () => parseLat(cells[headerMap['lng']] || '');

  // Stadtteil might be missing (Brandenburg tables use Entfernung instead)
  const getStadtteil = () => {
    if (headerMap['stadtteil'] !== undefined) return cells[headerMap['stadtteil']]?.trim() || '';
    return '';
  };

  // Season can be Saison, Zeit, or Datum
  const getSeason = () => {
    for (const key of ['saison', 'zeit', 'datum']) {
      if (headerMap[key] !== undefined) return cells[headerMap[key]]?.trim() || '';
    }
    return '';
  };

  const getPreis = () => cells[headerMap['preis']]?.trim() || '';

  // Instagram might be missing (Brandenburg spas)
  const getInstagram = () => {
    if (headerMap['instagram'] !== undefined) {
      return parseInstagramLinks(cells[headerMap['instagram']] || '');
    }
    return [];
  };

  const getBesonderheit = () => cells[headerMap['besonderheit']]?.trim() || '';

  const name = getName();
  if (!name) return null;

  return {
    name,
    categoryGroup: currentCategory,
    address: getAddress(),
    lat: getLat(),
    lng: getLng(),
    stadtteil: getStadtteil(),
    season: getSeason(),
    preis: getPreis(),
    instagram: getInstagram(),
    besonderheit: getBesonderheit(),
    oeffnungszeiten: null,
    beschreibung: null,
    isExpired: false,
  };
}

function main() {
  const md = readFileSync(MD_PATH, 'utf-8');
  const coordsRaw = JSON.parse(readFileSync(COORDS_PATH, 'utf-8'));

  const lines = md.split('\n');
  const places: RawPlace[] = [];
  let currentCategory = '';
  let currentHeaders: string[] = [];
  let inDetailsBlock = false;
  let detailsText = '';

  // First pass: extract table data
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect ## headings for category
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      const heading = line.replace('## ', '').trim();
      // Stop at non-category sections
      if (heading === 'Fehlende Informationen' || heading === 'Hinweise' || heading === 'Uebersicht') {
        currentCategory = '';
        continue;
      }
      for (const [key, val] of Object.entries(SECTION_TO_CATEGORY)) {
        if (heading.includes(key) || key.includes(heading)) {
          currentCategory = val;
          break;
        }
      }
      continue;
    }

    if (!currentCategory) continue;

    // Detect table headers
    if (line.startsWith('| Name ')) {
      currentHeaders = line.split('|').filter(Boolean).map(h => h.trim());
      continue;
    }

    // Skip separator rows
    if (line.startsWith('|---') || line.startsWith('| ---')) continue;

    // Parse table data rows
    if (line.startsWith('|') && currentHeaders.length > 0 && !line.startsWith('|---')) {
      const cells = line.split('|').slice(1, -1); // remove first and last empty
      if (cells.length >= 7) {
        const place = parseTableRow(cells, currentHeaders, currentCategory);
        if (place) {
          places.push(place);
        }
      }
      continue;
    }
  }

  // Second pass: extract details from <details> blocks
  let detailPlaces: Map<string, { oeffnungszeiten: string; beschreibung: string }> = new Map();
  let inDetails = false;
  let currentDetailText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<details>')) {
      inDetails = true;
      currentDetailText = '';
      continue;
    }
    if (line.includes('</details>')) {
      inDetails = false;
      // Parse the collected detail text
      const detailBlocks = currentDetailText.split(/\*\*([^*]+)\*\*\s*--\s*/);
      // detailBlocks: ['', 'Name1', 'description1...', 'Name2', 'description2...', ...]
      for (let j = 1; j < detailBlocks.length; j += 2) {
        const detailName = detailBlocks[j].trim();
        const detailDesc = (detailBlocks[j + 1] || '').trim();

        // Try to extract opening hours
        const hoursMatch = detailDesc.match(
          /(?:Mo|Di|Mi|Do|Fr|Sa|So|Taeglich|Apr|Okt|Jan|Feb|Mrz|Maerz|Sep|Nov)[^.]*(?:\d{1,2}(?::\d{2})?(?:\s*(?:Uhr|bis|-)\s*\d{1,2}(?::\d{2})?)?)[^.]*\./
        );
        const oeffnungszeiten = hoursMatch ? hoursMatch[0].replace(/\.$/, '') : '';

        detailPlaces.set(detailName, {
          oeffnungszeiten: oeffnungszeiten || '',
          beschreibung: detailDesc.split('.').slice(0, 3).join('.') + '.',
        });
      }
      continue;
    }
    if (inDetails && !line.includes('<summary>')) {
      currentDetailText += line + '\n';
    }
  }

  // Match details to places by name fuzzy matching
  for (const place of places) {
    // Try exact match first
    let detail = detailPlaces.get(place.name);

    // Try partial match
    if (!detail) {
      for (const [key, val] of detailPlaces.entries()) {
        if (place.name.includes(key) || key.includes(place.name) ||
            place.name.split(' ')[0] === key.split(' ')[0]) {
          detail = val;
          break;
        }
      }
    }

    if (detail) {
      place.oeffnungszeiten = detail.oeffnungszeiten || null;
      place.beschreibung = detail.beschreibung || null;
    }
  }

  // Merge coordinates from coordinates.json for places with null coords
  for (const place of places) {
    if (place.lat === null || place.lng === null) {
      // Try to find in coordinates.json
      for (const [coordName, coordData] of Object.entries(coordsRaw) as [string, any][]) {
        if (coordName === place.name ||
            place.name.includes(coordName) ||
            coordName.includes(place.name)) {
          if (coordData.lat && coordData.lng) {
            place.lat = coordData.lat;
            place.lng = coordData.lng;
          }
          break;
        }
      }
    }
  }

  // Mark expired events
  const expiredNames = ['Stranger Things', 'Lancome'];
  for (const place of places) {
    for (const expired of expiredNames) {
      if (place.name.includes(expired)) {
        place.isExpired = true;
      }
    }
  }

  // Generate output
  const output = places.map((p) => {
    const { min, max } = parsePrice(p.preis);
    return {
      id: toSlug(p.name),
      name: p.name,
      categoryGroup: p.categoryGroup,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      stadtteil: p.stadtteil,
      season: p.season,
      preis: p.preis,
      preisMin: min,
      preisMax: max,
      instagram: p.instagram,
      besonderheit: p.besonderheit,
      oeffnungszeiten: p.oeffnungszeiten,
      beschreibung: p.beschreibung,
      isExpired: p.isExpired,
    };
  });

  const tsContent = `// Auto-generated from BERLIN_AKTIVITAETEN.md — do not edit manually
// Generated: ${new Date().toISOString()}
import type { Place } from '../types';

export const PLACES: Place[] = ${JSON.stringify(output, null, 2)};
`;

  writeFileSync(OUTPUT_PATH, tsContent, 'utf-8');
  console.log(`Extracted ${output.length} places to ${OUTPUT_PATH}`);

  // Print summary
  const categories: Record<string, number> = {};
  for (const p of output) {
    categories[p.categoryGroup] = (categories[p.categoryGroup] || 0) + 1;
  }
  console.log('\nCategories:');
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`  ${cat}: ${count}`);
  }

  const withCoords = output.filter(p => p.lat !== null).length;
  const withInstagram = output.filter(p => p.instagram.length > 0).length;
  console.log(`\nWith coordinates: ${withCoords}/${output.length}`);
  console.log(`With Instagram: ${withInstagram}/${output.length}`);
}

main();
