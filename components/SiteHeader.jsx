'use client';
import { Building2, Database, Home, MapPin, Menu, Pause, Play, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CITIES } from '@/lib/api';
import { useExperience } from './Experience';

export default function SiteHeader() {
  const { enabled, toggle, reduced } = useExperience();
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  const links = [{ label:'Overview', href:'/' }, ...CITIES.map((city) => ({ label:city, href:`/${city.toLowerCase()}` }))];
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="clean-header"><div className="shell header-inner">
      <a href="/" className="brand-lockup" onClick={()=>setOpen(false)}><span>AIRSCOPE</span><small>West Bengal<br/>Atmospheric Observatory</small></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(link=><a key={link.href} href={link.href} aria-current={pathname===link.href?'page':undefined} className="nav-link">{link.label}</a>)}</nav>
      <div className="header-actions"><button className="motion-toggle" disabled={Boolean(reduced)} onClick={toggle} aria-label={enabled?'Pause decorative animations':'Enable decorative animations'} aria-pressed={!enabled} title={reduced ? 'Motion reduced by system preference' : enabled ? 'Pause animations' : 'Enable animations'}>{enabled?<Pause size={16}/>:<Play size={16}/>}</button><button className="mobile-menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-controls="mobile-menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
    </div>{open&&<nav id="mobile-menu" className="mobile-nav shell" aria-label="Mobile navigation" onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);document.querySelector('.mobile-menu-toggle')?.focus();}}}>{links.map((link,index)=><a key={link.href} href={link.href} onClick={()=>setOpen(false)} aria-current={pathname===link.href?'page':undefined}><span>0{index+1}</span>{link.label}<span>↗</span></a>)}</nav>}</header>
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation"><a href="/" onClick={()=>setOpen(false)} aria-current={pathname==='/'?'page':undefined}><Home size={17}/><span>Overview</span></a>{CITIES.map((city,index)=><a key={city} onClick={()=>setOpen(false)} href={`/${city.toLowerCase()}`} aria-current={pathname===`/${city.toLowerCase()}`?'page':undefined}>{index===0?<MapPin size={17}/>:<Building2 size={17}/>}<span>{city}</span></a>)}<a href="/#readings" onClick={()=>setOpen(false)}><Database size={17}/><span>Readings</span></a></nav>
  </>;
}
