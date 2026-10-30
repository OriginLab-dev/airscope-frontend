'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Pause, Play, MapPin, Clock3 } from 'lucide-react';
import { CITIES, aqiDisplay, aqiLabel, formatTime, formatValue } from '@/lib/api';
import { Magnetic, useExperience } from './Experience';

export function CityLandscape({ city }) {
  return <svg viewBox="0 0 600 240" fill="none" className="city-landscape" aria-hidden="true">
    <circle cx="465" cy="62" r="34" fill="currentColor" opacity=".12"/>
    <path d="M0 200Q140 175 300 202T600 195M0 214Q150 193 310 218T600 212M0 230Q150 209 310 233T600 225" stroke="currentColor" opacity=".18"/>
    {city === 'Asansol' ? <g stroke="currentColor" strokeWidth="2">
      <path d="M60 193V147L130 167V135L205 159V121L280 156V193M280 193V170H530V193"/>
      <path d="M332 170V49H350V170M410 170V72H428V170M488 170V35H503V170"/>
      <path d="M328 49H355M406 72H433M483 35H509M80 172H98M116 172H134M152 172H170M190 172H208M226 172H244"/>
      <path d="M342 28Q316 10 344 0M418 50Q451 27 421 8M497 16Q468 0 497-14" opacity=".35"/>
    </g> : <g stroke="currentColor" strokeWidth="2">
      <path d="M30 174H570M30 185H570M145 197V67M155 197V67M440 197V67M450 197V67M140 67H160M435 67H455"/>
      <path d="M35 174L150 71L300 145L445 71L570 174M150 71L445 71M150 71L225 174L300 71L370 174L445 71"/>
      <path d="M75 139V174M110 107V174M195 95V174M245 121V174M300 145V174M350 121V174M397 95V174M490 109V174M530 143V174" opacity=".55"/>
      {city === 'Kolkata' && <><path d="M215 194V162H282V194M230 162V146H268V162M237 146Q249 121 261 146M249 132V119"/><path d="M220 175H227M238 175H245M256 175H263M274 175H279"/></>}
    </g>}
  </svg>;
}

export default function CityExplorer({ latest, selected, onSelect }) {
  const { enabled } = useExperience();
  const [playing,setPlaying] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const [visible,setVisible] = useState(true);
  const [direction,setDirection] = useState(1);
  const city = CITIES[selected], reading = latest[selected];
  const select = index => {setDirection(index >= selected ? 1 : -1);onSelect((index + CITIES.length) % CITIES.length);};
  useEffect(() => {
    const changed=()=>setVisible(document.visibilityState === 'visible');
    changed();document.addEventListener('visibilitychange',changed);
    return ()=>document.removeEventListener('visibilitychange',changed);
  },[]);
  useEffect(() => {
    if (!playing || !enabled || hovered || focused || !visible) return;
    const timer=setInterval(()=>{setDirection(1);onSelect((selected+1)%CITIES.length);},6500);
    return ()=>clearInterval(timer);
  },[playing,enabled,hovered,focused,visible,selected,onSelect]);
  return <section className="city-explorer" id="cities" aria-label="Explore city air quality" aria-roledescription="carousel" data-reveal
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
    <div className="explorer-heading"><div><p className="eyebrow"><span className="section-number">01 /</span> The regional picture</p><h2>Three cities.<br/><em>One atmosphere.</em></h2></div><p>Explore the air where you are.<br/>Select a city to follow its latest station readings.</p></div>
    <div className="explorer-tabs" role="tablist" aria-label="Select a city" onKeyDown={event=>{
      const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
      if(delta){event.preventDefault();const index=(selected+delta+3)%3;select(index);document.getElementById('city-tab-'+index)?.focus();}
    }}>
      {CITIES.map((name,index)=><button id={'city-tab-'+index} key={name} role="tab" aria-controls="city-slide" aria-selected={selected===index} tabIndex={selected===index?0:-1} onClick={()=>select(index)}>
        <span className="tab-number">0{index+1}</span><span>{name}</span><small>AQI <b>{aqiDisplay(latest[index])}</b></small><ArrowRight size={18}/>
      </button>)}
    </div>
    <div className="slide-window">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.article key={city} id="city-slide" className="city-slide" role="tabpanel" aria-labelledby={'city-tab-'+selected}
          custom={direction} variants={{enter:d=>({opacity:0,x:enabled?d*45:0}),show:{opacity:1,x:0},exit:d=>({opacity:0,x:enabled?-d*45:0})}}
          initial="enter" animate="show" exit="exit" transition={{duration:enabled?.35:0}}
          drag={enabled?'x':false} dragConstraints={{left:0,right:0}} dragElastic={.07}
          onDragEnd={(_,info)=>{if(Math.abs(info.offset.x)>45)select(selected+(info.offset.x<0?1:-1));}}>
          <div className="slide-story"><p className="slide-overline"><MapPin size={14}/> WEST BENGAL, INDIA</p><h3>{city}<span>.</span></h3>
            <p className="slide-description">A closer look at the air in {city}. Explore recorded particulate levels and the station&apos;s air quality index.</p>
            <Magnetic><Link className="explore-button" href={'/'+city.toLowerCase()} draggable={false}>Explore {city}<ArrowRight size={18}/></Link></Magnetic>
            <span className="slide-time"><Clock3 size={13}/>{reading ? formatTime(reading.recordedAt):'Awaiting readings'}</span>
          </div>
          <div className="slide-visual" data-cursor="SWIPE">
            <CityLandscape city={city}/>
            <div className="slide-metrics"><div><span>Air quality index</span><strong>{aqiDisplay(reading)}</strong><small>{reading?.aqi == null&&!reading?.aqiDisplay?aqiLabel(reading):'AQI'}</small></div><div><span>PM2.5</span><strong>{formatValue(reading?.pm25)}</strong><small>µg/m³</small></div><div><span>PM10</span><strong>{formatValue(reading?.pm10)}</strong><small>µg/m³</small></div></div>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
    <div className="slider-controls"><span className="slide-counter" aria-live={playing?'off':'polite'}>0{selected+1} <i>/ 03</i></span><div className="slide-dots">{CITIES.map((name,index)=><button key={name} className={selected===index?'active':''} aria-label={'Show '+name} aria-pressed={selected===index} onClick={()=>select(index)}/>)}</div>
      <div className="slide-arrows"><button className="autoplay-control" disabled={!enabled} onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause automatic slides':'Play automatic slides'} aria-pressed={playing&&enabled}>{playing&&enabled?<Pause size={15}/>:<Play size={15}/>}</button><Magnetic><button aria-label="Previous city" onClick={()=>select(selected-1)}><ArrowLeft size={20}/></button></Magnetic><Magnetic><button aria-label="Next city" onClick={()=>select(selected+1)}><ArrowRight size={20}/></button></Magnetic></div>
    </div>
  </section>;
}
