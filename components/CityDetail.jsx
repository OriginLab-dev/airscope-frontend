'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock3, MapPin } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { CITIES, formatTime, formatValue, shortTime, aqiLabel, aqiDisplay } from '@/lib/api';
import { CityLandscape } from './CityExplorer';

const station = { Kolkata:'Victoria Memorial, Kolkata · WBPCB', Howrah:'Padmapukur, Howrah · WBPCB', Asansol:'OpenAQ Asansol Court Area · WBPCB' };
const fields = [['pm25','PM2.5'],['pm10','PM10'],['no2','NO2'],['so2','SO2'],['co','CO'],['o3','O3']];
const theme = { Kolkata:'city-kolkata', Howrah:'city-howrah', Asansol:'city-asansol' };

function ReadingTile({ label, value }) { return <article className="reading-tile"><span>{label}</span><strong>{formatValue(value)}</strong><small>µg/m³</small></article>; }

export default function CityDetail({ city, readings }) {
  const [series,setSeries] = useState(['pm25','pm10']);
  const sorted = [...readings].sort((a,b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  const latest = sorted.at(-1); const current = CITIES.indexOf(city); const previous = CITIES[(current + 2) % 3]; const next = CITIES[(current + 1) % 3];
  const toggle = (key) => setSeries(active => active.includes(key) ? active.length > 1 ? active.filter(item => item !== key) : active : [...active,key]);
  return <main className="city-page" id="main-content" tabIndex={-1}>
    <section className={`city-hero ${theme[city]}`}><div className="shell city-hero-grid"><div><Link href="/" className="city-back"><ArrowLeft size={15}/> BACK TO THE REGION</Link><p className="eyebrow">0{current+1} / STATION OBSERVATORY</p><h1>{city}<em>.</em></h1><p className="city-hero-location"><MapPin size={15}/>{station[city]}</p><p className="city-hero-copy">A closer look at the air around you.</p></div><CityLandscape city={city}/></div></section>
    <div className="shell city-content"><section className="current-panel"><div className="current-panel-top"><p className="eyebrow">Current reading</p><span><Clock3 size={13}/>{latest ? formatTime(latest.recordedAt) : 'Awaiting data'}</span></div><div className="current-layout"><div className="readings-grid">{fields.map(([key,label]) => <ReadingTile key={key} label={label} value={latest?.[key]}/>)}</div><aside className="aqi-box" title={latest?.aqiReason}><span>India AQI</span><strong>{aqiDisplay(latest)}</strong><small>{aqiLabel(latest)}</small></aside></div></section>
      <section className="city-trend-panel"><div className="city-trend-head"><div><p className="eyebrow">Stored trend</p><h2>Pollution trends · {city}</h2><p>All gas and particulate values use µg/m³.</p></div><div className="series-controls">{fields.slice(0,4).map(([key,label]) => <button key={key} onClick={() => toggle(key)} aria-pressed={series.includes(key)}>{label}</button>)}</div></div><div className="city-trend-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={sorted} margin={{top:8,right:8,left:-22,bottom:0}}><CartesianGrid vertical={false}/><XAxis dataKey="recordedAt" tickFormatter={shortTime} axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip labelFormatter={(value) => formatTime(String(value))} formatter={(value,name) => [`${formatValue(value)} µg/m³`,String(name).toUpperCase()]}/>{series.map((key,index) => <Line key={key} type="monotone" dataKey={key} name={key} stroke={['#08ae84','#2584e8','#a184f2','#f3a339'][index % 4]} strokeWidth={2.4} dot={{r:2.5}} connectNulls={false}/>)}</LineChart></ResponsiveContainer></div></section>
      <section className="city-info-grid"><article><p className="eyebrow">Reading details</p><dl><div><dt>Source</dt><dd>{latest?.source || station[city]}</dd></div><div><dt>Record time</dt><dd>{latest ? formatTime(latest.recordedAt) : 'Unavailable'}</dd></div><div><dt>Status</dt><dd>Stored AIRSCOPE record</dd></div></dl></article><aside><p className="eyebrow">Navigate</p><Link href={`/${previous.toLowerCase()}`}><ArrowLeft size={15}/>{previous}</Link><Link href="/">All cities <ArrowRight size={15}/></Link><Link href={`/${next.toLowerCase()}`}>{next}<ArrowRight size={15}/></Link></aside></section>
    </div>
  </main>;
}
