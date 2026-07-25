'use client';

import { useEffect, useState } from 'react';

/**
 * DetectionAnimation
 * Visual bertema "deteksi & hitung" — kotak viewfinder muncul di titik-titik
 * acak, garis scan bergerak turun berulang, dan counter di tengah berjalan
 * naik. Dipakai bersama oleh halaman login & register agar konsisten.
 */
export function DetectionAnimation() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= 128 ? 0 : c + 1));
    }, 90);
    return () => clearInterval(id);
  }, []);

  const boxes = [
    { top: '18%', left: '22%', size: 56, delay: '0s' },
    { top: '62%', left: '14%', size: 44, delay: '0.6s' },
    { top: '32%', left: '68%', size: 60, delay: '1.2s' },
    { top: '70%', left: '60%', size: 48, delay: '1.8s' },
    { top: '48%', left: '42%', size: 40, delay: '2.4s' },
    { top: '12%', left: '78%', size: 46, delay: '3s' },
  ];

  return (
    <div className="scan-grid relative flex h-full w-full items-center justify-center">
      <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-24" />

      {boxes.map((b, i) => (
        <div
          key={i}
          className="detection-box absolute rounded-md border-2 border-accent"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
          }}
        >
          <span className="detection-tag absolute -top-5 left-0 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-mono font-medium text-accent-foreground">
            ayam
          </span>
        </div>
      ))}

      <div className="relative hidden z-10 flex flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-surface/70 px-10 py-8 backdrop-blur-sm">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-2">
          Total terdeteksi
        </span>
        <span className="font-display text-6xl font-bold tabular-nums text-foreground">
          {count}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-confirmed">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-confirmed" />
          live scanning
        </span>
      </div>

      <style>{`
        .scan-line {
          background: linear-gradient(
            to bottom,
            var(--accent-soft) 0%,
            transparent 100%
          );
          animation: scan-move 4s ease-in-out infinite;
        }

        @keyframes scan-move {
          0% { transform: translateY(-6rem); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        .detection-box {
          opacity: 0;
          animation: box-appear 4.5s ease-in-out infinite;
        }

        @keyframes box-appear {
          0% { opacity: 0; transform: scale(0.85); }
          8% { opacity: 1; transform: scale(1); }
          35% { opacity: 1; transform: scale(1); }
          45% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(0.9); }
        }

        .detection-tag {
          opacity: inherit;
        }

        @media (prefers-reduced-motion: reduce) {
          .scan-line,
          .detection-box {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}