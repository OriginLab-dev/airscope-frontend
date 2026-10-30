'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MotionConfig, motion, useMotionValue, useSpring, useScroll, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';

const MotionContext = createContext({ enabled:false, toggle:() => {} });
export const useExperience = () => useContext(MotionContext);

function Cursor({ enabled }) {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness:380, damping:32 });
  const smoothY = useSpring(y, { stiffness:380, damping:32 });
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!enabled || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = event => {
      x.set(event.clientX); y.set(event.clientY); setVisible(true);
      const element = event.target instanceof Element ? event.target : null;
      setHover(Boolean(element?.closest('a,button,input,select,[role="tab"]')));
      setLabel(element?.closest('[data-cursor]')?.getAttribute('data-cursor') || '');
    };
    const hide = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive:true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, [enabled, x, y]);
  if (!enabled) return null;
  return <motion.div aria-hidden="true" className={`air-cursor ${hover ? 'is-hover' : ''} ${label ? 'has-label' : ''}`} style={{ x:smoothX, y:smoothY, opacity:visible ? 1 : 0 }}><span>{label}</span></motion.div>;
}

export function Magnetic({ children, className = '' }) {
  const { enabled } = useExperience();
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness:240, damping:20 });
  const sy = useSpring(y, { stiffness:240, damping:20 });
  return <motion.span className={`magnetic ${className}`} style={{ x:sx, y:sy }}
    onPointerMove={event => {
      if (!enabled || event.pointerType !== 'mouse') return;
      const rect=event.currentTarget.getBoundingClientRect();
      x.set((event.clientX-rect.left-rect.width/2)*.15);
      y.set((event.clientY-rect.top-rect.height/2)*.15);
    }} onPointerLeave={() => {x.set(0);y.set(0);}}>{children}</motion.span>;
}

export default function Experience({ children }) {
  const reduced = useReducedMotion();
  const [paused,setPaused] = useState(false);
  const path = usePathname();
  const root = useRef(null);
  const enabled = !reduced && !paused;
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    try {setPaused(localStorage.getItem('airscope-motion') === 'off');} catch {}
  }, []);
  useEffect(() => {
    if (!enabled || !root.current) return;
    const seen = new WeakSet();
    const animations = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animations.push(entry.target.animate(
          [{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],
          {duration:700,easing:'cubic-bezier(.22,1,.36,1)'},
        ));
      });
    }, {threshold:.08});
    const discover=() => root.current?.querySelectorAll('[data-reveal],.analysis-grid,.city-content > section').forEach(element => {
      if (!seen.has(element)) {seen.add(element);observer.observe(element);}
    });
    discover();
    const mutation = new MutationObserver(discover);
    mutation.observe(root.current,{childList:true,subtree:true});
    return () => {observer.disconnect();mutation.disconnect();animations.forEach(animation=>animation.cancel());};
  }, [enabled,path]);
  const toggle=() => setPaused(previous => {
    try {localStorage.setItem('airscope-motion',previous ? 'on':'off');} catch {}
    return !previous;
  });
  return <MotionContext.Provider value={{enabled,toggle}}>
    <MotionConfig reducedMotion={enabled ? 'never':'always'}>
      <div ref={root} className={`air-experience ${enabled ? 'motion-on':'motion-off'}`}>
        <motion.div className="reading-progress" aria-hidden="true" style={{scaleX:scrollYProgress}} />
        {children}
      </div>
      <Cursor enabled={enabled}/>
    </MotionConfig>
  </MotionContext.Provider>;
}
