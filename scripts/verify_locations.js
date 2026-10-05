import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
let key = process.env.GOOGLE_MAPS_API_KEY;
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const match = env.match(/GOOGLE_MAPS_API_KEY=(.*)/);
  if (match) key = match[1].trim();
}

if (!key) {
  console.error('No GOOGLE_MAPS_API_KEY found');
  process.exit(1);
}

const providersPath = path.resolve(__dirname, '../src/data/providers.json');
const providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'));

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function searchPlaces(query) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.types',
        Referer: 'http://localhost:5173/'
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: { latitude: 42.15, longitude: -82.9 },
            radius: 50000.0
          }
        },
        languageCode: 'en'
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      return { error: `HTTP ${res.status}: ${txt}` };
    }
    const data = await res.json();
    return { places: data.places || [] };
  } catch (err) {
    return { error: err.message };
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting verification of ${providers.length} locations...`);
  const results = [];

  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    process.stdout.write(`[${i + 1}/${providers.length}] Verifying: ${p.name} (ID: ${p.id})... `);

    // 1. Search by name + address
    let placeResult = null;
    let queryUsed = `${p.name}, ${p.address}`;
    let res = await searchPlaces(queryUsed);

    if (res.places && res.places.length) {
      // Pick best place within Windsor-Essex bounding box
      for (const cand of res.places) {
        const lat = cand.location?.latitude;
        const lng = cand.location?.longitude;
        if (lat >= 41.5 && lat <= 42.45 && lng >= -83.25 && lng <= -82.35) {
          placeResult = cand;
          break;
        }
      }
    }

    // 2. If no place match or place name looks completely different, try exact address
    let addressResult = null;
    if (!placeResult) {
      queryUsed = p.address;
      res = await searchPlaces(queryUsed);
      if (res.places && res.places.length) {
        addressResult = res.places[0];
      }
    }

    const verified = placeResult || addressResult;

    if (!verified || !verified.location) {
      console.log('NOT FOUND in Places API');
      results.push({
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        currentLat: p.lat,
        currentLng: p.lng,
        status: 'MANUAL_CHECK_NOT_FOUND',
        distanceDiffMeters: null,
        notes: 'Could not resolve place or address via Places API'
      });
    } else {
      const vLat = parseFloat(verified.location.latitude.toFixed(4));
      const vLng = parseFloat(verified.location.longitude.toFixed(4));
      const dist = Math.round(haversineDistance(p.lat, p.lng, vLat, vLng));

      let status = 'OK';
      if (dist > 300) {
        status = 'DISCREPANCY';
      }

      console.log(`${status} (diff: ${dist}m) -> ${verified.formattedAddress}`);
      results.push({
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        currentLat: p.lat,
        currentLng: p.lng,
        verifiedLat: vLat,
        verifiedLng: vLng,
        distanceDiffMeters: dist,
        status,
        verifiedName: verified.displayName?.text,
        verifiedAddress: verified.formattedAddress
      });
    }

    // Brief pause to avoid rate limits
    await delay(120);
  }

  const outputPath = path.resolve(__dirname, '../location_verification_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  const discrepancies = results.filter((r) => r.status === 'DISCREPANCY');
  const notFound = results.filter((r) => r.status === 'MANUAL_CHECK_NOT_FOUND');
  const ok = results.filter((r) => r.status === 'OK');

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Total: ${results.length}`);
  console.log(`OK (within 300m): ${ok.length}`);
  console.log(`Discrepancies (> 300m): ${discrepancies.length}`);
  console.log(`Not Found / Manual Check: ${notFound.length}`);
}

main();
