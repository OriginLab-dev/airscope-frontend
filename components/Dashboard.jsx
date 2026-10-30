'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, Cloud, Database, Leaf, MapPin, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { CITIES, formatTime, formatValue, newestByCity, shortTime, aqiLabel, aqiDisplay } from '@/lib/api';
import AirField from './AirField';
import CityExplorer from './CityExplorer';
import { Magnetic } from './Experience';

const cityTheme = { Kolkata:'city-kolkata', Howrah:'city-howrah', Asansol:'city-asansol' };

function CityCard({ city, reading, index }) {
  return <motion.article initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:index * .08 }} className="city-dashboard-card">
    <div className={`city-banner ${cityTheme[city]}`}><span>City monitor</span></div>
    <div className="city-card-content">
      <div className="city-name-line"><h3>{city}</h3><span className="city-aqi">AQI<br /><strong>{aqiDisplay(reading)}</strong></span></div>
      <p className="metric-kicker">Air quality index</p>
      {reading?.aqi == null && !reading?.aqiDisplay && <p className="city-status">{aqiLabel(reading)}</p>}
      <div className="city-stat-row"><div><span>PM2.5</span><strong>{formatValue(reading?.pm25)}</strong><small>µg/m³</small></div><div><span>PM10</span><strong>{formatValue(reading?.pm10)}</strong><small>µg/m³</small></div></div>
      <div className="city-card-footer"><span><Clock3 size={13} />{reading ? formatTime(reading.recordedAt) : 'Awaiting data'}</span><Link className="mini-link focus-ring" href={`/${city.toLowerCase()}`}>View details <ArrowRight size={13} /></Link></div>
    </div>
  </motion.article>;
}

function Pollutant({ label, field, reading, icon }) { return <article className="pollutant-tile"><span className="pollutant-icon">{icon}</span><div><p>{label}</p><strong>{formatValue(reading?.[field])}</strong><small>µg/m³ · stored measurement</small></div></article>; }

export default function Dashboard({ readings }) {
  const [metric, setMetric] = useState('pm25');
  const [selected, setSelected] = useState(0);
  const latest = newestByCity(readings);
  const freshest = latest.filter(Boolean).sort((a,b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0];
  const active = latest[selected];
  const trends = readings.filter((item) => item.city === CITIES[selected]).sort((a,b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  const labels = { pm25:'PM2.5', pm10:'PM10', aqi:'AQI' };
  return <>
    <section className="atmosphere" id="main-content" tabIndex={-1}><div className="hero-dot-grid" aria-hidden="true"/><div className="shell hero-reference">
      <div className="hero-copy-wrap"><p className="eyebrow"><span className="live-signal"/> WEST BENGAL / AIR QUALITY OBSERVATORY</p>
        <h1><span className="headline-mask"><span>Know the air.</span></span><span className="headline-mask"><em>Feel connected.</em></span></h1>
        <p>Three cities. Millions of breaths. Explore the air around Kolkata, Howrah and Asansol through their latest station readings.</p>
        <div className="hero-cta"><Magnetic><a className="primary-action" href="#cities">Explore the cities <ArrowRight size={18}/></a></Magnetic><a className="text-action" href="#readings">Follow the trends <span>↘</span></a></div>
        <div className="hero-chips"><span><Leaf size={15}/> PM2.5</span><span><Wind size={15}/> PM10</span><span><Database size={15}/> AQI</span></div>
      </div>
      <div className="earth-stage" data-cursor="MOVE"><span className="earth-coordinate">22.57° N / 88.36° E</span><AirField/><span className="earth-caption"><i/> ONE SHARED ATMOSPHERE</span></div>
    </div><div className="shell hero-bottom"><span>03 CITIES <i/> ONE CONNECTED REGION</span><span><Clock3 size={13}/>{freshest?formatTime(freshest.recordedAt):'Awaiting data'}</span><a href="#cities" className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></a></div></section>
    <div className="air-ticker" aria-hidden="true"><div>{[0,1].map(i=><span key={i}>KOLKATA <b>✳</b> HOWRAH <b>✳</b> ASANSOL <b>✳</b> AIR IN MOTION <b>✳</b> </span>)}</div></div>
    <main className="shell dashboard-shell"><CityExplorer latest={latest} selected={selected} onSelect={setSelected}/>
      <section className="analysis-grid" id="readings"><article className="chart-card"><div className="chart-head"><div><p className="eyebrow">Hourly analysis</p><h2>Pollution trends</h2><p>Recent stored records · {CITIES[selected]}</p></div><div className="metric-tabs" role="group" aria-label="Trend metric">{Object.entries(labels).map(([key,label]) => <button key={key} aria-pressed={metric === key} onClick={() => setMetric(key)}>{label}</button>)}</div></div><div className="chart-current"><span>Current {labels[metric]}</span><strong>{metric === 'aqi' ? aqiDisplay(active) : formatValue(active?.[metric])}</strong><small>{metric === 'aqi' ? aqiLabel(active) : 'µg/m³'}</small></div><div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trends} margin={{top:8,right:8,left:-22,bottom:0}}><defs><linearGradient id="aquaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0bb98f" stopOpacity=".24"/><stop offset="1" stopColor="#0bb98f" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false}/><XAxis dataKey="recordedAt" tickFormatter={shortTime} axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip labelFormatter={(value) => formatTime(String(value))} formatter={(value) => [`${formatValue(value)} ${metric === 'aqi' ? '' : 'µg/m³'}`, labels[metric]]}/><Area type="monotone" dataKey={metric} stroke={metric === 'pm10' ? '#2584e8' : metric === 'aqi' ? '#8ca5b4' : '#08ae84'} strokeWidth={2.5} fill="url(#aquaFill)" connectNulls={false}/></AreaChart></ResponsiveContainer></div><div className="chart-note"><span>Times are shown in UTC</span><span>Units: {metric === 'aqi' ? 'index' : 'µg/m³'}</span></div></article>
      <aside className="pollutants-card"><p className="eyebrow">Pollutant breakdown</p><h2>What is in the air?</h2><p>Latest available pollutant concentrations for {CITIES[selected]}.</p><div className="pollutant-grid"><Pollutant label="PM2.5" field="pm25" reading={active} icon="≋"/><Pollutant label="PM10" field="pm10" reading={active} icon="≋"/><Pollutant label="Nitrogen dioxide" field="no2" reading={active} icon="◌"/><Pollutant label="Ozone" field="o3" reading={active} icon="◉"/></div></aside></section></main>
    <footer className="reference-footer"><div className="shell"><strong><Leaf size={20} />AirScope</strong><span>Readings stored in the AIRSCOPE database.<br />Not a substitute for official health advice.</span><Cloud size={18} /></div></footer>
  </>;
}
