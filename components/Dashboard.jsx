'use client';

import { ArrowRight, Clock3 } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo, useState } from 'react';
import { CITIES, formatTime, formatValue, newestByCity, shortTime, aqiLabel, aqiDisplay } from '@/lib/api';
import RegionalModel from './RegionalModel';
import { ReadingStatus } from './Loading';
import { Magnetic, useExperience } from './Experience';
import SiteFooter from './SiteFooter';

const colors = ['#146247', '#377c83', '#956225'];
const metrics = { aqi: 'AQI', pm25: 'PM2.5', pm10: 'PM10' };
const pollutants = [['pm25','PM2.5'],['pm10','PM10'],['no2','NO₂'],['so2','SO₂'],['co','CO'],['o3','O₃']];

export default function Dashboard({ readings, status }) {
  const { enabled } = useExperience();
  const [metric, setMetric] = useState('aqi');
  const latest = newestByCity(readings);
  const freshest = latest.filter(Boolean).sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0];
  const trends = useMemo(() => {
    const hours = new Map();
    for (const reading of readings) {
      const time = Date.parse(reading.recordedAt);
      if (!Number.isFinite(time)) continue;
      const hour = hours.get(time) ?? { time };
      hour[reading.city] = reading[metric];
      hours.set(time, hour);
    }
    return [...hours.values()].sort((a, b) => a.time - b.time).slice(-24);
  }, [readings, metric]);
  const hasTrend = trends.some(hour => CITIES.some(city => hour[city] != null));

  return <>
    <main id="main-content" tabIndex={-1}>
      <section className="regional-hero"><div className="shell regional-hero-grid">
        <div className="regional-hero-copy">
          <h1>Air quality across <em>West Bengal.</em></h1>
          <p>Compare station readings for Kolkata, Howrah, and Asansol, and see how air quality changes hour by hour.</p>
          <div className="hero-cta"><Magnetic><a className="primary-action" href="#cities">Compare cities <ArrowRight size={18} /></a></Magnetic><a className="text-action" href="#readings">View trends</a></div>
          <ReadingStatus {...status} hasData={Boolean(freshest)} />
          {freshest && <p className="observation-time"><Clock3 size={15} /> Latest record <time dateTime={freshest.recordedAt}>{formatTime(freshest.recordedAt)}</time></p>}
        </div>
        <RegionalModel />
      </div></section>

      <div className="shell observatory-content regional-content">
        <section className="data-section" id="cities">
          <h2>Latest readings by station</h2>
          <p>Latest available air-quality observations across the three cities.</p>
          <div className="station-cards">
            {CITIES.map((city, index) => {
              const reading = latest[index];
              return <article className={"station-card station-" + city.toLowerCase()} key={city}>
                <h3><a href={'/' + city.toLowerCase()}>{city}<ArrowRight size={19} /></a></h3>
                <dl><div className="station-aqi"><dt>India AQI</dt><dd>{aqiDisplay(reading)}</dd></div></dl>
                <p className="aqi-category">{reading?.aqiCategory || aqiLabel(reading)}</p>
                <dl className="station-particulates">
                  {pollutants.slice(0, 2).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{formatValue(reading?.[key])} <small>µg/m³</small></dd></div>)}
                </dl>
              </article>;
            })}
          </div>
        </section>

        <section className="data-section overview-analysis" id="readings">
          <article>
            <div className="data-heading">
              <div><h2>Hourly trend</h2><p>Recent observations across all three stations</p></div>
              <div className="metric-tabs" role="group" aria-label="Trend metric">{Object.entries(metrics).map(([key, label]) => <button key={key} aria-pressed={metric === key} onClick={() => setMetric(key)}>{label}</button>)}</div>
            </div>
            <div className="observatory-chart">{hasTrend ? <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickFormatter={shortTime} minTickGap={24} />
                <YAxis width={44} />
                <Tooltip labelFormatter={value => formatTime(value)} formatter={(value, name) => [formatValue(value, metric === 'aqi' ? 0 : 1), name]} />
                <Legend />
                {CITIES.map((city, index) => <Line key={city} dataKey={city} name={city} stroke={colors[index]} strokeWidth={2.4} dot={{ r: 2 }} connectNulls={false} isAnimationActive={enabled} />)}
              </LineChart>
            </ResponsiveContainer> : <p className="empty-chart">{status.loading ? 'Fetching hourly observations…' : 'No hourly observations for this metric.'}</p>}</div>
            <p className="chart-caption">{metrics[metric]} {metric === 'aqi' ? '(index)' : '(µg/m³)'} · Time in UTC</p>
          </article>

          <aside className="regional-summary">
            <h2>Pollutant summary</h2>
            <p>Average of each station’s latest available value.</p>
            <dl>{pollutants.map(([key, label]) => {
              const values = latest.flatMap(reading => Number.isFinite(reading?.[key]) ? [reading[key]] : []);
              const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
              return <div key={key}><dt>{label}</dt><dd>{formatValue(mean)} <small>µg/m³</small></dd></div>;
            })}</dl>
          </aside>
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
