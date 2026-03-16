/* ═══════════════════════════════════════════════════════════════════════════
   Where in the World? – Geography guessing game
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Landmark data ────────────────────────────────────────────────────────────
// To add a new landmark, just supply the exact Wikipedia page title (spaces as underscores).
// The image is fetched automatically from Wikipedia at startup — no image URL needed.
const LANDMARKS = [
  { name: 'Eiffel Tower',         location: 'Paris, France',              lat: 48.8584,  lng:   2.2945,  wiki: 'Eiffel_Tower' },
  { name: 'Great Pyramid of Giza',location: 'Giza, Egypt',                lat: 29.9792,  lng:  31.1342,  wiki: 'Great_Pyramid_of_Giza' },
  { name: 'Statue of Liberty',    location: 'New York, USA',              lat: 40.6892,  lng: -74.0445,  wiki: 'Statue_of_Liberty' },
  { name: 'Taj Mahal',            location: 'Agra, India',                lat: 27.1751,  lng:  78.0421,  wiki: 'Taj_Mahal' },
  { name: 'Christ the Redeemer',  location: 'Rio de Janeiro, Brazil',     lat: -22.9519, lng: -43.2105,  wiki: 'Christ_the_Redeemer_(statue)' },
  { name: 'Sydney Opera House',   location: 'Sydney, Australia',          lat: -33.8568, lng: 151.2153,  wiki: 'Sydney_Opera_House' },
  { name: 'Machu Picchu',         location: 'Cusco Region, Peru',         lat: -13.1631, lng: -72.5450,  wiki: 'Machu_Picchu' },
  { name: 'Mount Fuji',           location: 'Honshu, Japan',              lat:  35.3606, lng: 138.7274,  wiki: 'Mount_Fuji' },
  { name: 'Colosseum',            location: 'Rome, Italy',                lat:  41.8902, lng:  12.4922,  wiki: 'Colosseum' },
  { name: 'Big Ben',              location: 'London, United Kingdom',     lat:  51.5007, lng:  -0.1246,  wiki: 'Big_Ben' },
];

// ── Scoring thresholds ────────────────────────────────────────────────────────
const SCORING = [
  { maxKm: 200,  points: 5, label: '⭐⭐⭐ Amazing!',   cls: 'pts-5' },
  { maxKm: 500,  points: 3, label: '⭐⭐ Great job!',   cls: 'pts-3' },
  { maxKm: 1000, points: 1, label: '⭐ Not bad!',       cls: 'pts-1' },
  { maxKm: Infinity, points: 0, label: 'Keep trying!',  cls: 'pts-0' },
];

// ── State ────────────────────────────────────────────────────────────────────
let totalScore = 0;
let roundNumber = 1;
let currentLandmark = null;
let shuffledDeck = [];

let guessMarker = null;
let realMarker  = null;
let linePath    = null;
let hasGuessed  = false;

// ── Map setup ────────────────────────────────────────────────────────────────
const map = L.map('map', {
  center: [20, 0],
  zoom: 2,
  minZoom: 1,
  maxZoom: 10,
  zoomControl: true,
  attributionControl: true,
  // Wrap the world so panning feels natural on mobile
  worldCopyJump: true,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
}).addTo(map);

// Custom divIcon factory
function makeIcon(cls) {
  return L.divIcon({ className: cls, iconSize: [28, 28], iconAnchor: [14, 14] });
}

// ── Haversine distance (km) ───────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Score calculation ────────────────────────────────────────────────────────
function calcScore(km) {
  return SCORING.find((s) => km < s.maxKm);
}

// ── Deck shuffle (Fisher-Yates) ───────────────────────────────────────────────
function freshDeck() {
  const deck = [...LANDMARKS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function showResultPanel() { $('result-panel').classList.remove('hidden'); }
function hideResultPanel() { $('result-panel').classList.add('hidden'); }
function showHint()        { $('tap-hint').classList.remove('hidden'); }
function hideHint()        { $('tap-hint').classList.add('hidden'); }

// ── Clear map layers from previous round ──────────────────────────────────────
function clearMapLayers() {
  if (guessMarker) { map.removeLayer(guessMarker); guessMarker = null; }
  if (realMarker)  { map.removeLayer(realMarker);  realMarker  = null; }
  if (linePath)    { map.removeLayer(linePath);     linePath    = null; }
}

// ── Start a new round ────────────────────────────────────────────────────────
function newRound() {
  // Refill deck when exhausted
  if (shuffledDeck.length === 0) {
    shuffledDeck = freshDeck();
  }

  currentLandmark = shuffledDeck.pop();
  hasGuessed = false;

  clearMapLayers();
  hideResultPanel();
  showHint();

  // Reset map view so the user doesn't see the answer position
  map.setView([20, 0], 2);

  // Update UI
  $('landmark-name').textContent = currentLandmark.name;
  $('challenge-image').src = currentLandmark.image;
  $('challenge-image').alt = currentLandmark.name;
  $('round').textContent = roundNumber;
  $('score').textContent = totalScore;
}

// ── Handle map click (the guess) ──────────────────────────────────────────────
map.on('click', (e) => {
  if (hasGuessed) return;   // ignore extra clicks while result is shown
  hasGuessed = true;

  hideHint();

  const { lat, lng } = e.latlng;
  const lm = currentLandmark;

  // Place guess marker (blue)
  guessMarker = L.marker([lat, lng], { icon: makeIcon('guess-marker-icon') })
    .addTo(map)
    .bindTooltip('Your guess', { permanent: false, direction: 'top' });

  // Place real marker (pink)
  realMarker = L.marker([lm.lat, lm.lng], { icon: makeIcon('real-marker-icon') })
    .addTo(map)
    .bindTooltip(lm.name, { permanent: true, direction: 'top' });

  // Draw connecting line
  linePath = L.polyline(
    [[lat, lng], [lm.lat, lm.lng]],
    { color: '#f9c74f', weight: 2.5, dashArray: '6 5', opacity: 0.85 }
  ).addTo(map);

  // Fit both markers in view with padding
  map.fitBounds(
    L.latLngBounds([lat, lng], [lm.lat, lm.lng]),
    { padding: [50, 50], maxZoom: 6, animate: true }
  );

  // Calculate result
  const km = haversineKm(lat, lng, lm.lat, lm.lng);
  const result = calcScore(km);

  totalScore += result.points;
  roundNumber++;

  // Populate result panel
  $('landmark-image').src = lm.image;
  $('landmark-image').alt = lm.name;
  $('result-name').textContent = lm.name;
  $('result-location').textContent = `📍 ${lm.location}`;
  $('result-distance').textContent = `📏 Distance: ${Math.round(km).toLocaleString()} km away`;

  const ptsEl = $('result-points');
  ptsEl.textContent = result.points > 0
    ? `${result.label} +${result.points} point${result.points > 1 ? 's' : ''}`
    : `${result.label} — 0 points`;
  ptsEl.className = result.cls;

  $('score').textContent = totalScore;
  $('round').textContent = roundNumber;

  showResultPanel();
});

// ── Load images from Wikipedia REST API ──────────────────────────────────────
// Wikipedia's REST API has CORS enabled and is designed for third-party use.
// Each landmark only needs a `wiki` page title — no image URL maintenance required.
async function loadWikiImages() {
  await Promise.all(LANDMARKS.map(async (lm) => {
    try {
      const res  = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(lm.wiki)}`);
      const data = await res.json();
      lm.image   = data.thumbnail?.source ?? '';
    } catch (_) {
      lm.image = '';
    }
  }));
}

// ── Boot ──────────────────────────────────────────────────────────────────────
$('landmark-name').textContent = 'Loading images…';
loadWikiImages().then(() => {
  shuffledDeck = freshDeck();
  newRound();
});
