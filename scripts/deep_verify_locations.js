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

const providersPath = path.resolve(__dirname, '../src/data/providers.json');
const providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'));

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function search(q) {
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
        textQuery: q,
        locationBias: {
          circle: { center: { latitude: 42.15, longitude: -82.9 }, radius: 50000.0 }
        },
        languageCode: 'en'
      })
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.places || [];
  } catch (err) {
    return [];
  }
}

function nameSimilarity(name1, name2) {
  if (!name1 || !name2) return 0;
  const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const words1 = n1.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'farm', 'farms', 'market'].includes(w));
  if (!words1.length) return 0;
  let matches = 0;
  for (const w of words1) {
    if (n2.includes(w)) matches++;
  }
  return matches / words1.length;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting deep verification of ${providers.length} locations...`);
  const report = [];

  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    process.stdout.write(`[${i + 1}/${providers.length}] ${p.name}... `);

    // 1. Search place by name + address
    const namePlaces = await search(`${p.name} ${p.address}`);
    await delay(60);

    // 2. Geocode address
    const addrPlaces = await search(p.address);
    await delay(60);

    const placeCandidate = namePlaces.find(c => {
      const lat = c.location?.latitude;
      const lng = c.location?.longitude;
      return lat >= 41.5 && lat <= 42.45 && lng >= -83.25 && lng <= -82.35;
    });

    const addrCandidate = addrPlaces.find(c => {
      const lat = c.location?.latitude;
      const lng = c.location?.longitude;
      return lat >= 41.5 && lat <= 42.45 && lng >= -83.25 && lng <= -82.35;
    });

    let bestChoice = null;
    let confidence = 'high';
    let source = '';

    const sim = placeCandidate ? nameSimilarity(p.name, placeCandidate.displayName?.text) : 0;

    if (placeCandidate && sim >= 0.5) {
      bestChoice = placeCandidate;
      source = 'place_search';
      confidence = 'high';
    } else if (addrCandidate) {
      bestChoice = addrCandidate;
      source = 'address_geocode';
      confidence = placeCandidate && sim > 0 ? 'medium' : 'high';
    } else if (placeCandidate) {
      bestChoice = placeCandidate;
      source = 'place_search_low_match';
      confidence = 'needs_manual_review';
    } else {
      confidence = 'needs_manual_review';
    }

    if (!bestChoice) {
      console.log('UNRESOLVED');
      report.push({
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        currentLat: p.lat,
        currentLng: p.lng,
        confidence: 'needs_manual_review',
        issue: 'Could not find address or place in Windsor-Essex'
      });
    } else {
      const vLat = parseFloat(bestChoice.location.latitude.toFixed(4));
      const vLng = parseFloat(bestChoice.location.longitude.toFixed(4));
      const diff = Math.round(haversineDistance(p.lat, p.lng, vLat, vLng));

      console.log(`diff: ${diff}m (${source}, conf: ${confidence})`);
      report.push({
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        currentLat: p.lat,
        currentLng: p.lng,
        verifiedLat: vLat,
        verifiedLng: vLng,
        diffMeters: diff,
        source,
        confidence,
        verifiedName: bestChoice.displayName?.text,
        verifiedAddress: bestChoice.formattedAddress,
        needsCorrection: diff > 250
      });
    }
  }

  const outPath = path.resolve(__dirname, '../deep_verification_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  const needingCorrection = report.filter(r => r.needsCorrection);
  const manualReview = report.filter(r => r.confidence === 'needs_manual_review');
  const accurate = report.filter(r => !r.needsCorrection && r.confidence !== 'needs_manual_review');

  console.log('\n=== DEEP VERIFICATION SUMMARY ===');
  console.log(`Total: ${report.length}`);
  console.log(`Accurate (diff <= 250m): ${accurate.length}`);
  console.log(`Needs Correction (diff > 250m): ${needingCorrection.length}`);
  console.log(`Needs Manual Review / Ambiguous: ${manualReview.length}`);
}

main();
