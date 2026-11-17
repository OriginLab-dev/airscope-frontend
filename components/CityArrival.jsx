'use client';

import { useEffect, useRef } from 'react';
import { useExperience } from './Experience';

const cityArtwork = {
  Overview: '/airscope-overview-cover.png',
  Asansol: '/asansol-factory.png',
  Howrah: '/howrah-bridge.png',
  Kolkata: '/kolkata-victoria-memorial.png',
};

export default function CityArrival({ city }) {
  const asset = cityArtwork[city];
  const { enabled } = useExperience();
  const artwork = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const host = artwork.current;
    const target = canvas.current;
    if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = target.getContext('2d');
    if (!context) return;
    const image = new Image();
    let frame;
    let start;
    let cancelled = false;

    image.onload = () => {
      if (cancelled) return;
      const stencil = document.createElement('canvas');
      stencil.width = 600;
      stencil.height = 240;
      const mask = stencil.getContext('2d');
      if (!mask) return;
      const scale = Math.min(600 / image.naturalWidth, 240 / image.naturalHeight);
      const imageWidth = image.naturalWidth * scale;
      const imageHeight = image.naturalHeight * scale;
      mask.drawImage(image, 600 - imageWidth, 240 - imageHeight, imageWidth, imageHeight);
      const pixels = mask.getImageData(0, 0, 600, 240).data;
      const dots = [];
      for (let y = 1; y < 240; y += 2.7) {
        for (let x = 1 + (Math.floor(y / 2.7) % 2) * 1.3; x < 600; x += 2.7) {
          const pixel = (Math.floor(y) * 600 + Math.floor(x)) * 4;
          const alpha = pixels[pixel + 3] / 255;
          if (alpha < .08) continue;
          dots.push({
            x, y, alpha,
            color: `rgb(${pixels[pixel]}, ${pixels[pixel + 1]}, ${pixels[pixel + 2]})`,
            fromX: Math.random() * 660 - 30,
            fromY: Math.random() * 245,
            offset: Math.random() * 320,
            curl: (Math.random() - .5) * 95,
          });
        }
      }
      if (!dots.length) return;

      target.width = 1200;
      target.height = 480;
      context.scale(2, 2);
      host.dataset.assembling = 'true';

      function draw(time) {
        start ??= time;
        const elapsed = time - start;
        context.clearRect(0, 0, 600, 240);
        for (const dot of dots) {
          const progress = Math.min(1, Math.max(0, (elapsed - dot.offset) / 950));
          const ease = 1 - (1 - progress) ** 3;
          const arc = Math.sin(progress * Math.PI);
          const x = dot.fromX + (dot.x - dot.fromX) * ease + arc * dot.curl;
          const y = dot.fromY + (dot.y - dot.fromY) * ease - arc * 24;
          context.fillStyle = dot.color;
          context.globalAlpha = dot.alpha * (.34 + ease * .66);
          context.beginPath();
          context.arc(x, y, 1.05, 0, Math.PI * 2);
          context.fill();
        }
        if (elapsed < 1300) frame = requestAnimationFrame(draw);
        else host.dataset.assembling = 'false';
      }

      frame = requestAnimationFrame(draw);
    };
    image.src = asset;
    return () => {
      cancelled = true;
      image.onload = null;
      cancelAnimationFrame(frame);
      delete host.dataset.assembling;
    };
  }, [asset, enabled]);

  return <div ref={artwork} className="station-artwork" aria-hidden="true">
    <img src={asset} className="station-artwork-image" alt="" />
    <canvas ref={canvas} />
  </div>;
}
