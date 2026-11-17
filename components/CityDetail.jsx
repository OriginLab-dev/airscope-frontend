'use client';

import { ArrowRight } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { CITIES, formatTime, formatValue, shortTime, aqiLabel, aqiDisplay } from '@/lib/api';
import { ReadingStatus } from './Loading';
import { useExperience } from './Experience';
import CityArrival from './CityArrival';
import SiteFooter from './SiteFooter';

const stations = { Kolkata: 'Victoria Memorial', Howrah: 'Padmapukur', Asansol: 'Court Area' };
const fields = [
  ['pm25', 'PM2.5', '#14553d'], ['pm10', 'PM10', '#4b8963'], ['no2', 'NO₂', '#366d96'],
  ['so2', 'SO₂', '#8a6230'], ['co', 'CO', '#855080'], ['o3', 'O₃', '#557648'],
];

export default function CityDetail({ city, readings, status }) {
  const { enabled } = useExperience();
  const [series, setSeries] = useState(['pm25', 'pm10']);
  const sorted = [...readings].sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  const latest = sorted.at(-1);
  const activeFields = fields.filter(([key]) => series.includes(key));
  const hasTrend = sorted.some(reading => activeFields.some(([key]) => reading[key] != null));

  function toggle(key) {
    setSeries(active => active.includes(key) ? active.filter(item => item !== key) : [...active, key]);
  }

  return <>
    <main className="city-page station-page" id="main-content" tabIndex={-1}>
      <section className={'station-hero station-' + city.toLowerCase()}>
        <div className="shell station-hero-grid">
          <div><h1>{city}</h1><p>{stations[city]} station</p><span>Air-quality observations · West Bengal</span></div>
          <CityArrival city={city} />
        </div>
      </section>

      <div className="shell observatory-content">
        <section className="station-band" aria-labelledby="latest-readings">
          <h2 id="latest-readings">Latest readings</h2>
          <dl>
            <div><dt>India AQI</dt><dd className="band-aqi">{aqiDisplay(latest)}</dd></div>
            {fields.slice(0, 2).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{formatValue(latest?.[key])} <small>µg/m³</small></dd></div>)}
            <div><dt>Status</dt><dd><span className="aqi-category" title={latest?.aqiReason}>{latest?.aqiCategory || aqiLabel(latest)}</span></dd></div>
            <div><dt>Observation time</dt><dd className="station-time">{latest ? <time dateTime={latest.recordedAt}>{formatTime(latest.recordedAt)}</time> : 'Unavailable'}</dd></div>
          </dl>
        </section>
        <ReadingStatus {...status} hasData={Boolean(latest)} />

        <section className="data-section city-hours">
          <div className="data-heading">
            <div><h2>Hourly trend</h2><p>Recent pollutant concentrations at {stations[city]} station</p></div>
            <div className="metric-tabs station-series" role="group" aria-label="Pollutants displayed">
              {fields.map(([key, label, color]) => <button key={key} type="button" onClick={() => toggle(key)} aria-pressed={series.includes(key)} disabled={series.length === 1 && series.includes(key)}><i style={{ background: color }} />{label}</button>)}
            </div>
          </div>
          <div className="observatory-chart">{hasTrend ? <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sorted} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="recordedAt" tickFormatter={shortTime} minTickGap={22} />
              <YAxis width={44} />
              <Tooltip labelFormatter={formatTime} formatter={(value, label) => [formatValue(value) + ' µg/m³', label]} />
              {activeFields.map(([key, label, color]) => <Line key={key} dataKey={key} name={label} stroke={color} strokeWidth={2.4} dot={{ r: 2 }} connectNulls={false} isAnimationActive={enabled} />)}
            </LineChart>
          </ResponsiveContainer> : <p className="empty-chart">{status.loading ? 'Fetching hourly observations…' : 'No hourly observations for these pollutants.'}</p>}</div>
          <p className="chart-caption">Concentration (µg/m³) · Time in UTC</p>
        </section>

        <section className="data-section observation-details">
          <h2>Observation details</h2>
          <dl><div><dt>Station</dt><dd>{stations[city]}</dd></div><div><dt>City</dt><dd>{city}, West Bengal</dd></div><div><dt>Source</dt><dd>{latest?.source || 'Awaiting source data'}</dd></div><div><dt>Pollutants</dt><dd>{fields.map(([, label]) => label).join(', ')}</dd></div></dl>
        </section>

        <section className="data-section">
          <h2>Other stations</h2>
          <div className="station-links"><a href="/">Overview <ArrowRight size={18} /></a>{CITIES.filter(name => city !== name).map(name => <a key={name} href={'/' + name.toLowerCase()}>{name}<ArrowRight size={18} /></a>)}</div>
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
