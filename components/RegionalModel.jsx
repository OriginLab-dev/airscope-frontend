'use client';

import { useEffect, useRef } from 'react';
import { useExperience } from './Experience';
import CityArrival from './CityArrival';

export default function RegionalModel() {
  const { enabled } = useExperience();
  const artwork = useRef(null);
  const drag = useRef(null);
  const pose = useRef({ x: 0, y: 0 });

  function tilt(x, y) {
    pose.current = { x: Math.max(-16, Math.min(16, x)), y: Math.max(-23, Math.min(23, y)) };
    artwork.current.style.setProperty('--cover-x', pose.current.x + 'deg');
    artwork.current.style.setProperty('--cover-y', pose.current.y + 'deg');
  }

  function down(event) {
    if (event.button !== 0 || !event.isPrimary) return;
    clearHover();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, ...{ pitch: pose.current.x, yaw: pose.current.y } };
  }

  function clearHover() {
    artwork.current?.style.removeProperty('--hover-x');
    artwork.current?.style.removeProperty('--hover-y');
  }

  useEffect(() => {
    if (!enabled) clearHover();
  }, [enabled]);

  function move(event) {
    const start = drag.current;
    if (start?.id === event.pointerId) {
      tilt(start.pitch - (event.clientY - start.y) * .12, start.yaw + (event.clientX - start.x) * .12);
      return;
    }
    if (!enabled || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    artwork.current.style.setProperty('--hover-x', -y * 12 + 'deg');
    artwork.current.style.setProperty('--hover-y', x * 18 + 'deg');
  }

  function release(event) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  function key(event) {
    const offsets = { ArrowUp: [4, 0], ArrowDown: [-4, 0], ArrowLeft: [0, -4], ArrowRight: [0, 4] };
    if (event.key === 'Home') {
      event.preventDefault();
      tilt(0, 0);
    } else if (offsets[event.key]) {
      event.preventDefault();
      const [x, y] = offsets[event.key];
      tilt(pose.current.x + x, pose.current.y + y);
    }
  }

  return <figure className="regional-model">
    <div className="regional-model-stage regional-cover-stage" tabIndex={0} role="img"
      aria-label="Dotted panorama of the Asansol skyline, Howrah Bridge, and Victoria Memorial. Drag or use arrow keys to tilt."
      onPointerDown={down} onPointerMove={move} onPointerLeave={clearHover} onLostPointerCapture={release} onKeyDown={key}>
      <div ref={artwork} className="regional-cover-artwork"><CityArrival city="Overview" /></div>
    </div>
    <figcaption><span>West Bengal in dots</span><span>Drag to tilt</span></figcaption>
  </figure>;
}
