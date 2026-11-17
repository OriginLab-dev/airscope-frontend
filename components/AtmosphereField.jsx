'use client';

import { useEffect, useRef } from 'react';
import { useExperience } from './Experience';

const TAU = Math.PI * 2;

const cityOrbits = [
  { city: 'Kolkata', color: '#236b4d', tilt: -.45, phase: 2.95, major: 1.48, minor: .40 },
  { city: 'Howrah', color: '#356b72', tilt: .2, phase: 4.2, major: 1.46, minor: .78 },
  { city: 'Asansol', color: '#866129', tilt: .54, phase: 5.85, major: 1.50, minor: .55 },
];

function drawOrbits(context, cx, cy, radius, width, height, opacity, rotation) {
  if (opacity <= 0) return;
  const globeEdge = radius * 1.037;
  const orbitTilt = Math.sin(rotation) * .10;
  context.save();
  context.lineWidth = 1;

  for (const { color, tilt, major, minor } of cityOrbits) {
    context.strokeStyle = color;
    context.globalAlpha = opacity * .25;
    context.beginPath();
    context.ellipse(cx, cy, radius * major, radius * minor, tilt + orbitTilt, 0, Math.PI);
    context.stroke();

    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.moveTo(cx + globeEdge, cy);
    context.arc(cx, cy, globeEdge, 0, TAU);
    context.clip('evenodd');
    context.globalAlpha = opacity * .15;
    context.setLineDash([2, 4]);
    context.beginPath();
    context.ellipse(cx, cy, radius * major, radius * minor, tilt + orbitTilt, Math.PI, TAU);
    context.stroke();
    context.restore();
  }

  const labels = [];
  for (const { city, color, tilt, phase, major, minor } of cityOrbits) {
    const angle = phase + rotation * 1.7;
    const plane = tilt + orbitTilt;
    const depth = Math.sin(angle);
    const along = Math.cos(angle) * radius * major;
    const across = depth * radius * minor;
    const x = cx + along * Math.cos(plane) - across * Math.sin(plane);
    const y = cy + along * Math.sin(plane) + across * Math.cos(plane);
    const moonRadius = 6.5 + depth * 1.4;
    const clearance = Math.hypot(x - cx, y - cy) - globeEdge;
    const visibility = depth >= 0 ? 1 : Math.max(0, Math.min(1, (clearance + moonRadius) / (2 * moonRadius)));
    if (!visibility) continue;
    context.globalAlpha = opacity * visibility;
    const light = context.createRadialGradient(
      x - moonRadius * .34, y - moonRadius * .4, .3, x, y, moonRadius,
    );
    light.addColorStop(0, '#fafff1');
    light.addColorStop(.25, '#dce8cf');
    light.addColorStop(.74, color);
    light.addColorStop(1, '#243b31');
    context.beginPath();
    context.arc(x, y, moonRadius, 0, TAU);
    context.fillStyle = light;
    context.fill();
    context.strokeStyle = '#f5f6ef';
    context.lineWidth = 1.2;
    context.stroke();
    labels.push({ city, color, x, y, visibility });
  }

  context.font = '600 12px system-ui, sans-serif';
  context.textBaseline = 'middle';
  const placed = [];
  for (const { city, color, x, y, visibility } of labels) {
    const labelWidth = context.measureText(city).width;
    const labelX = Math.max(4, Math.min(width - labelWidth - 4, x - labelWidth / 2));
    const offsets = y < cy ? [-17, 17, -31, 31] : [17, -17, 31, -31];
    const labelY = offsets.map(offset => Math.max(9, Math.min(height - 9, y + offset)))
      .find(candidate => placed.every(label => Math.abs(label.y - candidate) > 14
        || labelX + labelWidth + 5 < label.left || labelX > label.right + 5));
    if (labelY === undefined) continue;
    placed.push({ y: labelY, left: labelX, right: labelX + labelWidth });
    context.globalAlpha = opacity * visibility;
    context.lineWidth = 4;
    context.strokeStyle = '#f5f6ef';
    context.strokeText(city, labelX, labelY);
    context.fillStyle = color;
    context.fillText(city, labelX, labelY);
  }
  context.restore();
}

const points = Array.from({ length: 1450 }, (_, index) => {
  const y = 1 - 2 * (index + .5) / 1450;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * 2.399963;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const land = Math.sin(x * 8 + 2 * z) + Math.cos(y * 12 - z * 7) + Math.sin(z * 11 + x * 4);
  const seed = (n) => (Math.sin((index + 1) * n) * 43758.5453) % 1;
  return { x, y, z, land: land > .32, fromX: Math.abs(seed(78.23)), fromY: Math.abs(seed(19.19)), delay: Math.abs(seed(43.3)) * .24 };
});


export default function AtmosphereField() {
  const { enabled } = useExperience();
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const interaction = useRef({ yaw: -.4, pitch: -.2, drag: null });
  const introduced = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let start;
    let previous;
    let visible = true;
    let fullscreen = false;
    let width = 0;
    let height = 0;
    const intro = enabled && !introduced.current && window.scrollY < 40 && !location.hash;
    const duration = 1900;

    function resize(full) {
      fullscreen = full;
      canvas.classList.toggle('sphere-arriving', full);
      const rectangle = full ? document.documentElement.getBoundingClientRect() : stage.getBoundingClientRect();
      width = full ? document.documentElement.clientWidth : rectangle.width;
      height = full ? innerHeight : rectangle.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function render(time) {
      frame = 0;
      start ??= time;
      const progress = intro ? Math.min(1, (time - start) / duration) : 1;
      if (progress === 1 && fullscreen) resize(false);
      const dt = Math.min(35, time - (previous ?? time));
      previous = time;
      const control = interaction.current;
      if (enabled && !control.drag && visible && !document.hidden) control.yaw += dt * .00024;
      const bounds = stage.getBoundingClientRect();
      const cx = (fullscreen ? bounds.left : 0) + bounds.width * .5;
      const cy = (fullscreen ? bounds.top : 0) + bounds.height * .5;
      const radius = Math.min(bounds.width, bounds.height) * .32;
      const fade = 1 - Math.max(0, (progress - .24) / .76);
      context.clearRect(0, 0, width, height);
      if (fullscreen) {
        context.fillStyle = 'rgba(241,243,239,' + fade + ')';
        context.fillRect(0, 0, width, height);
      }
      const sinY = Math.sin(control.yaw), cosY = Math.cos(control.yaw);
      const sinP = Math.sin(control.pitch), cosP = Math.cos(control.pitch);
      const projected = points.map(point => {
        const x = point.x * cosY + point.z * sinY;
        const rotatedZ = point.z * cosY - point.x * sinY;
        const y = point.y * cosP - rotatedZ * sinP;
        const z = point.y * sinP + rotatedZ * cosP;
        return { point, x, y, z };
      }).sort((a, b) => a.z - b.z);

      for (const item of projected) {
        const { point, x, y, z } = item;
        const perspective = 3.8 / (3.8 - z);
        const p = Math.max(0, Math.min(1, (progress - point.delay) / (1 - point.delay)));
        const ease = 1 - (1 - p) ** 3;
        const sweep = Math.sin(p * Math.PI) * (point.fromY - .5) * radius * .4;
        const px = (fullscreen ? point.fromX * width * (1 - ease) : 0) + (cx + x * radius * perspective) * ease + sweep;
        const py = (fullscreen ? point.fromY * height * (1 - ease) : 0) + (cy + y * radius * perspective) * ease;
        const lit = Math.max(0, Math.min(1, .48 + z * .43 - x * .14 - y * .12));
        context.globalAlpha = point.land ? .17 + lit * .81 : .11 + lit * .51;
        context.fillStyle = point.land ? '#14563c' : '#387b71';
        context.beginPath();
        context.arc(px, py, (point.land ? 2.08 : 1.6) * perspective, 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
      drawOrbits(context, cx, cy, radius, width, height, Math.max(0, (progress - .72) / .28), control.yaw + .4);
      if (progress === 1) introduced.current = true;
      if (progress < 1 || (enabled && visible && !document.hidden)) frame = requestAnimationFrame(render);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    function move(event) {
      const control = interaction.current;
      if (control.drag?.id !== event.pointerId) return;
      control.yaw += (event.clientX - control.drag.x) * .009;
      control.pitch = Math.max(-1.45, Math.min(1.45, control.pitch + (event.clientY - control.drag.y) * .009));
      control.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      schedule();
    }
    function down(event) {
      if (fullscreen || event.button !== 0) return;
      stage.setPointerCapture(event.pointerId);
      interaction.current.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }
    function up(event) {
      if (interaction.current.drag?.id === event.pointerId) interaction.current.drag = null;
    }
    function key(event) {
      const controls = { ArrowLeft: [-.17, 0], ArrowRight: [.17, 0], ArrowUp: [0, -.17], ArrowDown: [0, .17] };
      if (!controls[event.key]) return;
      event.preventDefault();
      const [x, y] = controls[event.key];
      interaction.current.yaw += x;
      interaction.current.pitch = Math.max(-1.45, Math.min(1.45, interaction.current.pitch + y));
      schedule();
    }

    resize(intro);
    schedule();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    const observer = new ResizeObserver(() => { resize(fullscreen); schedule(); });
    intersection.observe(stage);
    observer.observe(stage);
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('lostpointercapture', up);
    stage.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      observer.disconnect();
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('lostpointercapture', up);
      stage.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', schedule);
      interaction.current.drag = null;
      canvas.classList.remove('sphere-arriving');
    };
  }, [enabled]);

  return <figure className="particle-earth">
    <div ref={stageRef} className="particle-earth-stage" tabIndex={0} role="img"
      aria-label="Interactive particle Earth with three orbiting moons labeled Kolkata, Howrah, and Asansol. Drag or use arrow keys to rotate the sphere.">
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
    <figcaption>Drag to rotate</figcaption>
  </figure>;
}
