import { CITIES } from '@/lib/api';

export default function SiteFooter() {
  return <footer className="observatory-footer shell">
    <div><a href="/" className="footer-wordmark">AIRSCOPE</a><p>West Bengal Atmospheric Observatory</p></div>
    <p>Station-based air-quality observations for Kolkata, Howrah, and Asansol. AIRSCOPE calculates India AQI from available station data.</p>
    <nav aria-label="Footer navigation"><a href="/">Overview</a>{CITIES.map(city => <a key={city} href={'/' + city.toLowerCase()}>{city}</a>)}</nav>
  </footer>;
}
