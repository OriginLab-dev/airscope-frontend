'use client';
import Link from 'next/link';
import { Building2, Database, Home, Leaf, MapPin, Menu, Pause, Play, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CITIES } from '@/lib/api';
import { useExperience } from './Experience';

export default function SiteHeader() {
  const { enabled, toggle } = useExperience();
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  const links = [{ label:'Overview', href:'/' }, ...CITIES.map((city) => ({ label:city, href:`/${city.toLowerCase()}` }))];
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="clean-header"><div className="shell header-inner">
      <Link href="/" className="brand-lockup" onClick={()=>setOpen(false)}><Leaf size={28}/><span>AirScope<small>AIR QUALITY, IN MOTION</small></span></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(link=><Link key={link.href} href={link.href} aria-current={pathname===link.href?'page':undefined} className="nav-link">{link.label}</Link>)}</nav>
      <div className="header-actions"><button className="motion-toggle" onClick={toggle} aria-label={enabled?'Pause decorative animations':'Enable decorative animations'} aria-pressed={!enabled} title={enabled?'Pause animations':'Enable animations'}>{enabled?<Pause size={16}/>:<Play size={16}/>}</button><button className="mobile-menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-controls="mobile-menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
    </div>{open&&<nav id="mobile-menu" className="mobile-nav shell" aria-label="Mobile navigation" onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);document.querySelector('.mobile-menu-toggle')?.focus();}}}>{links.map((link,index)=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)} aria-current={pathname===link.href?'page':undefined}><span>0{index+1}</span>{link.label}<span>↗</span></Link>)}</nav>}</header>
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation"><Link href="/" onClick={()=>setOpen(false)} aria-current={pathname==='/'?'page':undefined}><Home size={17}/><span>Overview</span></Link>{CITIES.map((city,index)=><Link key={city} onClick={()=>setOpen(false)} href={`/${city.toLowerCase()}`} aria-current={pathname===`/${city.toLowerCase()}`?'page':undefined}>{index===0?<MapPin size={17}/>:<Building2 size={17}/>}<span>{city}</span></Link>)}<Link href="/#readings" onClick={()=>setOpen(false)}><Database size={17}/><span>Readings</span></Link></nav>
  </>;
}
