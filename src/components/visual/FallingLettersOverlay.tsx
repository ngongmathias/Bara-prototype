import React, { useEffect, useRef } from "react";

type Props = {
  density?: number; // letters per 10k px^2
  opacity?: number; // 0..1
  zIndex?: number;
  paused?: boolean;
};

export const FallingLettersOverlay: React.FC<Props> = ({
  density = 0.006,
  opacity = 0.06,
  zIndex = 0,
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      w: window.innerWidth,
      h: window.innerHeight,
      items: [] as { x: number; y: number; v: number; ch: string; size: number }[],
    };

    const resize = () => {
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvas.width = state.w;
      canvas.height = state.h;
      const area = state.w * state.h;
      const count = Math.max(4, Math.floor(area * density * 0.0001));
      state.items = Array.from({ length: count }).map(() => ({
        x: Math.random() * state.w,
        y: Math.random() * state.h,
        v: 0.4 + Math.random() * 0.8,
        ch: letters[Math.floor(Math.random() * letters.length)],
        size: 10 + Math.random() * 14,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, state.w, state.h);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#000000"; // monochrome black
      for (const it of state.items) {
        ctx.font = `${it.size}px sans-serif`;
        ctx.fillText(it.ch, it.x, it.y);
        if (!paused && !prefersReduced) {
          it.y += it.v;
          if (it.y > state.h + 20) {
            it.y = -20;
            it.x = Math.random() * state.w;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density, opacity, paused]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex, pointerEvents: "none" }}
    />
  );
};
