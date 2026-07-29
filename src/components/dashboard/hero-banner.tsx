"use client";

import * as React from "react";
import { Check, Target, Zap, Gauge, Radio } from "lucide-react";
import Image from "next/image";

const badges = [
  { icon: Target, label: "Akurat" },
  { icon: Zap, label: "Cepat" },
  { icon: Gauge, label: "Efisien" },
];

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-900/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950">
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative grid grid-cols-1 items-center gap-6 p-6 sm:p-8 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
            Identifikasi dan Perhitungan{" "}
            <span className="text-emerald-400">Ayam Broiler</span>
          </h1>
          <p className="text-sm font-medium text-emerald-400">
            Menggunakan Algoritma YOLO v12
          </p>
          <p className="max-w-md text-sm text-zinc-400">
            Sistem berbasis Computer Vision untuk mengenali dan menghitung
            ayam broiler secara otomatis dan akurat.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm text-zinc-300">
                <Icon className="h-4 w-4 text-emerald-400" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden h-48 overflow-hidden rounded-lg border border-emerald-900/40 md:block">
          <Image
            src="/hero-chickens.jpg"
            alt="Peternakan ayam broiler"
            fill
            className="object-cover"
          />
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-black">
            YOLO
            <span className="rounded bg-black/20 px-1.5">v12</span>
          </div>
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
            <Check className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}