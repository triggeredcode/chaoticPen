'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface PenCanvasProps {
  imageSrc: string;
}

export default function PenCanvas({ imageSrc }: PenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coverage, setCoverage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const engineRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = window.innerWidth * 0.85;
      const maxH = window.innerHeight * 0.75;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      canvas.width = w;
      canvas.height = h;

      const tc = document.createElement('canvas');
      tc.width = w;
      tc.height = h;
      const tCtx = tc.getContext('2d')!;
      tCtx.drawImage(img, 0, 0, w, h);
      const sourceData = tCtx.getImageData(0, 0, w, h).data;

      ctx.fillStyle = '#f5f0eb';
      ctx.fillRect(0, 0, w, h);

      const engine = createEngine(w, h, sourceData, ctx);
      engineRef.current = engine;
      startTimeRef.current = performance.now();

      const animate = () => {
        if (!engine.paused) {
          for (let i = 0; i < 150; i++) {
            engine.step();
            engine.draw(ctx);
          }
          const secs = (performance.now() - startTimeRef.current) / 1000;
          setElapsed(Math.floor(secs));
          if (engine.totalSteps % 400 === 0) {
            setCoverage(engine.computeCoverage());
          }
        }
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    };
    img.src = imageSrc;

    return () => cancelAnimationFrame(rafRef.current);
  }, [imageSrc]);

  const togglePause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.paused = !engineRef.current.paused;
      setPaused((p) => !p);
    }
  }, []);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `chaotic-pen-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }, []);

  const mm = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const ss = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-16">
      <div className="flex items-center gap-6 rounded-full bg-black/60 px-5 py-2 text-sm backdrop-blur-md">
        <span className="font-mono text-lg font-bold">{mm}:{ss}</span>
        <span className="font-mono text-amber-400">{coverage}%</span>
      </div>
      <canvas
        ref={canvasRef}
        className="rounded shadow-2xl"
        style={{ background: '#f5f0eb' }}
      />
      <div className="flex items-center gap-3 rounded-full bg-panel px-6 py-3 shadow-2xl backdrop-blur-lg">
        <button
          onClick={togglePause}
          className="rounded-full border border-gray-600 px-4 py-1.5 text-xs uppercase tracking-wider text-gray-300 transition hover:border-white hover:text-white"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <div className="h-6 w-px bg-gray-700" />
        <button
          onClick={handleExport}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-gray-200"
        >
          Export PNG
        </button>
      </div>
    </div>
  );
}

function createEngine(
  w: number,
  h: number,
  sourceData: Uint8ClampedArray,
  ctx: CanvasRenderingContext2D,
) {
  const n = w * h;
  const darknessMap = new Float32Array(n);
  const errorMap = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const pi = i * 4;
    const lum = sourceData[pi] * 0.21 + sourceData[pi + 1] * 0.72 + sourceData[pi + 2] * 0.07;
    darknessMap[i] = 1.0 - lum / 255.0;
    errorMap[i] = darknessMap[i];
  }

  let px = w / 2;
  let py = h / 2;
  let vx = (Math.random() - 0.5) * 2;
  let vy = (Math.random() - 0.5) * 2;
  let lpx = px;
  let lpy = py;
  let wanderAngle = Math.random() * Math.PI * 2;
  let smoothDark = 0;

  const engine = {
    totalSteps: 0,
    paused: false,

    step() {
      this.totalSteps++;
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      const pidx = iy * w + ix;
      const ld = ix >= 0 && ix < w && iy >= 0 && iy < h ? darknessMap[pidx] : 0;
      smoothDark = smoothDark * 0.92 + ld * 0.08;

      let sx = 0;
      let sy = 0;

      const sr = 35;
      for (let ox = -sr; ox <= sr; ox += 4) {
        for (let oy = -sr; oy <= sr; oy += 4) {
          const cx = ix + ox;
          const cy = iy + oy;
          if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
            const e = errorMap[cy * w + cx];
            if (e > 0.05) {
              const d = Math.sqrt(ox * ox + oy * oy) || 1;
              sx += (ox / d) * (e / d) * 0.08;
              sy += (oy / d) * (e / d) * 0.08;
            }
          }
        }
      }

      const dwl = 1.0 + ld * 1.2;
      wanderAngle += (Math.random() - 0.5) * 0.4 * dwl;
      sx += Math.cos(wanderAngle) * 0.02;
      sy += Math.sin(wanderAngle) * 0.02;

      if (px < 25) sx += 0.04 * (1 - px / 25);
      if (px > w - 25) sx -= 0.04 * (1 - (w - px) / 25);
      if (py < 25) sy += 0.04 * (1 - py / 25);
      if (py > h - 25) sy -= 0.04 * (1 - (h - py) / 25);

      vx += sx;
      vy += sy;
      const spd = Math.sqrt(vx * vx + vy * vy);
      const maxSpd = 3 * Math.max(0.3, 1.0 - ld * 0.4);
      if (spd > maxSpd) {
        vx = (vx / spd) * maxSpd;
        vy = (vy / spd) * maxSpd;
      }

      lpx = px;
      lpy = py;
      px = Math.max(1, Math.min(w - 1, px + vx));
      py = Math.max(1, Math.min(h - 1, py + vy));

      const dr = 5;
      const da = 0.008;
      const cix = Math.floor(px);
      const ciy = Math.floor(py);
      for (let ox = -dr; ox <= dr; ox++) {
        for (let oy = -dr; oy <= dr; oy++) {
          const epx = cix + ox;
          const epy = ciy + oy;
          if (epx >= 0 && epx < w && epy >= 0 && epy < h) {
            const dist = Math.sqrt(ox * ox + oy * oy);
            if (dist <= dr) {
              errorMap[epy * w + epx] = Math.max(
                0,
                errorMap[epy * w + epx] - da * (1.0 - dist / dr),
              );
            }
          }
        }
      }
    },

    draw(drawCtx: CanvasRenderingContext2D) {
      const d = smoothDark;
      const lw = 0.2 + d * 1.6;
      const alpha = 0.03 + d * 0.67;
      drawCtx.strokeStyle = `rgba(20, 15, 10, ${alpha})`;
      drawCtx.lineWidth = lw;
      drawCtx.lineCap = 'round';
      drawCtx.beginPath();
      drawCtx.moveTo(lpx, lpy);
      drawCtx.lineTo(px, py);
      drawCtx.stroke();
    },

    computeCoverage(): number {
      let totalErr = 0;
      let totalDark = 0;
      for (let i = 0; i < n; i += 10) {
        totalErr += errorMap[i];
        totalDark += darknessMap[i];
      }
      return totalDark > 0 ? Math.round((1 - totalErr / totalDark) * 100) : 0;
    },
  };

  return engine;
}
