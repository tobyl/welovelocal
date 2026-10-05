// Source: Google Maps Platform Code Assist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('\x1b[31mError: GOOGLE_MAPS_API_KEY is not set.\x1b[0m');
  console.log('Please provide a Google Maps API Key or Maps Demo Key in your environment or in a .env file.');
  console.log('Example: export GOOGLE_MAPS_API_KEY="your-api-key"');
  process.exit(1);
}

const providersPath = path.resolve(__dirname, '../src/data/providers.json');
const currentProviders = JSON.parse(fs.readFileSync(providersPath, 'utf8'));
const currentNames = new Set(currentProviders.map(p => p.name.toLowerCase().trim()));

const QUERIES = [
  'farm stand in Essex County Ontario',
  'roadside produce stand in Essex County Ontario',
  'fruit orchard in Essex County Ontario',
  'farmers market in Essex County Ontario',
  'honey farm in Essex County Ontario',
  'country market in Essex County Ontario'
];

async function searchPlaces(query) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: {
          latitude: 42.15,
          longitude: -82.9
        },
        radius: 45000.0
      }
    },
    languageCode: 'en'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.regularOpeningHours,places.types,places.editorialSummary',
      'X-Goog-Maps-Solution-ID': 'gmp_git_agentskills_v1',
      'Referer': 'http://localhost:5173/'
    },

    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.places || [];
}

function mapToCategory(types) {
  if (!types || !Array.isArray(types)) return 'other';
  if (types.includes('farm') || types.includes('orchard')) return 'farm';
  if (types.includes('market') || types.includes('grocery_store')) return 'market';
  return 'roadside-stand';
}

async function run() {
  console.log(`Starting Google Places API search across ${QUERIES.length} queries...`);
  const candidatesById = new Map();

  for (const q of QUERIES) {
    console.log(`Searching: "${q}"...`);
    try {
      const places = await searchPlaces(q);
      console.log(` -> Found ${places.length} places`);
      for (const p of places) {
        if (!p.id || candidatesById.has(p.id)) continue;

        const name = p.displayName?.text || 'Unknown';
        const cleanName = name.toLowerCase().trim();

        // Check if already in providers.json
        if (currentNames.has(cleanName)) {
          continue;
        }

        // Bounding box check for Windsor-Essex region
        const lat = p.location?.latitude;
        const lng = p.location?.longitude;
        if (!lat || !lng || lat < 41.5 || lat > 42.45 || lng < -83.25 || lng > -82.35) {
          continue;
        }

        candidatesById.set(p.id, {
          placeId: p.id,
          name,
          category: mapToCategory(p.types),
          address: p.formattedAddress,
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          description: p.editorialSummary?.text || `${name} in Essex County.`,
          website: p.websiteUri || null,
          types: p.types,
          openNow: p.regularOpeningHours?.openNow
        });
      }
    } catch (err) {
      console.error(`Error searching "${q}":`, err.message);
    }
  }

  const candidateList = Array.from(candidatesById.values());
  const outputPath = path.resolve(__dirname, '../candidates_google_places.json');
  fs.writeFileSync(outputPath, JSON.stringify(candidateList, null, 2));

  console.log(`\n\x1b[32mCompleted! Found ${candidateList.length} new candidate locations in Windsor-Essex.\x1b[0m`);
  console.log(`Results saved to: candidates_google_places.json`);
}

run();
