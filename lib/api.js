export const CITIES = ['Kolkata', 'Howrah', 'Asansol'];
export function aqiDisplay(reading) {
  return reading?.aqiDisplay || formatValue(reading?.aqi, 0);
}
export function aqiLabel(reading) {
  if (!reading) return 'Awaiting station readings';
  if (reading.aqiCategory) return `${reading.aqiCategory} · India AQI (calculated)`;
  return reading.aqiStatus || (reading.aqi == null ? 'Insufficient data for AQI' : reading.source?.endsWith(' · hourly mean') ? 'India AQI (calculated)' : 'Reported AQI');
}
// Requests use Next.js' server-side rewrite. The browser stays same-origin,
// so Vercel previews do not need their individual URLs added to backend CORS.
const API_BASE = '';
const NUMERIC_FIELDS = ['aqi', 'pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];

function asNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeReading(reading) {
  const normalized = { ...reading };
  for (const field of NUMERIC_FIELDS) normalized[field] = asNumber(reading[field]);
  return normalized;
}

export async function getReadings(city, limit = 24, signal) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (city) query.set('city', city);
  const response = await fetch(`${API_BASE}/api/air-quality?${query.toString()}`, { cache: 'no-store', signal });
  if (!response.ok) throw new Error(response.status === 503 ? 'The data service is temporarily unavailable.' : 'Unable to load air-quality readings.');
  const data = await response.json();
  return Array.isArray(data.readings) ? data.readings.map(normalizeReading) : [];
}

export function newestByCity(readings) {
  return CITIES.map((city) => readings.filter((item) => item.city === city).sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0]);
}

export function formatValue(value, digits = 1) {
  const numericValue = asNumber(value);
  return numericValue === null ? '—' : numericValue.toFixed(digits);
}
export function formatTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Unknown time' : new Intl.DateTimeFormat('en-IN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short', timeZone:'UTC', timeZoneName:'short' }).format(date); }
export function shortTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-IN', { hour:'2-digit', minute:'2-digit', timeZone:'UTC' }).format(date); }
