'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { MotionConfig, motion, useMotionValue, useSpring, useScroll, useReducedMotion } from 'motion/react';


const MotionContext = createContext({ enabled:false, toggle:() => {} });
export const useExperience = () => useContext(MotionContext);

function TrackingCursor() {
  const element = useRef(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 460, damping: 35 });
  const smoothY = useSpring(y, { stiffness: 460, damping: 35 });

  useEffect(() => {
    const cursor = element.current;
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    function hide() {
      cursor.dataset.visible = 'false';
    }
    function track(event) {
      if (!mouse.matches || event.pointerType !== 'mouse') return;
      if (cursor.dataset.visible !== 'true') {
        smoothX.jump(event.clientX);
        smoothY.jump(event.clientY);
      }
      x.set(event.clientX);
      y.set(event.clientY);
      cursor.dataset.visible = 'true';
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('button:not(:disabled), a[href], [role="button"]');
      cursor.dataset.mode = control ? 'control' : target?.closest('.regional-model-stage') ? 'artwork' : 'default';
    }
    window.addEventListener('pointermove', track, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    return () => {
      window.removeEventListener('pointermove', track);
      document.documentElement.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, [x, y, smoothX, smoothY]);

  return <motion.div ref={element} className="tracking-cursor" aria-hidden="true" style={{ x: smoothX, y: smoothY }}><span /></motion.div>;
}

export function Magnetic({ children, className = '' }) {
  const { enabled } = useExperience();
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness:240, damping:20 });
  const sy = useSpring(y, { stiffness:240, damping:20 });
  useEffect(() => { if (!enabled) { x.set(0); y.set(0); } }, [enabled, x, y]);
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


  const enabled = !reduced && !paused;
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    try {setPaused(localStorage.getItem('airscope-motion') === 'off');} catch {}
  }, []);

  const toggle=() => setPaused(previous => {
    try {localStorage.setItem('airscope-motion',previous ? 'on':'off');} catch {}
    return !previous;
  });
  return <MotionContext.Provider value={{enabled,toggle,reduced}}>
    <MotionConfig reducedMotion={enabled ? 'never':'always'}>
      <div className={`air-experience ${enabled ? 'motion-on':'motion-off'}`}>
        <motion.div className="reading-progress" aria-hidden="true" style={{scaleX:scrollYProgress}} />
        {children}
      </div>
      {enabled && <TrackingCursor />}

    </MotionConfig>
  </MotionContext.Provider>;
}
