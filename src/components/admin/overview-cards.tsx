"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bird, Gauge, Zap, LayoutGrid, ScanLine, Cpu, Boxes, Target, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import type { YoloDetectionStats } from "@/types/detection";

export function YoloDetectionOverview({ stats }: { stats: any }) {
  const densityPct = Math.round((stats.jumlahTerdeteksi / stats.kapasitasKandang) * 100);

  const cards = [
    {
      label: "Ayam Terdeteksi",
      value: stats.jumlahTerdeteksi.toLocaleString("id-ID"),
      icon: Bird,
      accent: "text-accent bg-accent-soft",
    },
    {
      label: "Akurasi Deteksi",
      value: `${stats.akurasiPersen.toFixed(1)}%`,
      icon: Target,
      accent: "text-confirmed bg-confirmed-soft",
    },
    {
      label: "Kecepatan Inferensi",
      value: `${stats.fps.toFixed(1)} FPS`,
      icon: Zap,
      accent: "text-[#7c9cbf] bg-[#7c9cbf1a]",
    },
  ];

  // Tahapan pipeline YOLOv12 untuk deteksi ayam broiler
  const pipeline = [
    { step: "Input Frame", desc: "Cuplikan CCTV kandang", icon: ScanLine },
    { step: "Backbone", desc: "Ekstraksi fitur (CSPDarknet)", icon: Cpu },
    { step: "Neck (PAFPN)", desc: "Penggabungan fitur multi-skala", icon: Boxes },
    { step: "Detection Head", desc: "Prediksi bounding box + kelas", icon: LayoutGrid },
    { step: "NMS + Count", desc: "Hilangkan box duplikat, hitung total", icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Kartu statistik deteksi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
          >
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-2">{c.label}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                    {c.value}
                  </p>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${c.accent}`}>
                  <c.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
        >
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-2">Kepadatan Kandang</p>
                <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                  {densityPct}%
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
                <Gauge className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Progress value={densityPct} className="h-1.5" aria-label="Kepadatan kandang" />
              <p className="text-xs text-muted-2">
                {stats.jumlahTerdeteksi} dari {stats.kapasitasKandang} ekor
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Diagram alur cara kerja YOLOv12 */}
      <Card className="p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-2">
          Cara Kerja Algoritma YOLOv12
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {pipeline.map((p, i) => (
            <React.Fragment key={p.step}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 + i * 0.08, ease: "easeOut" }}
                className="flex flex-1 flex-col items-center rounded-md border border-border bg-muted/30 p-4 text-center"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <p.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold">{p.step}</p>
                <p className="mt-1 text-xs text-muted-2">{p.desc}</p>
              </motion.div>
              {i < pipeline.length - 1 && (
                <div className="hidden items-center justify-center lg:flex">
                  <ArrowRight className="h-4 w-4 text-muted-2" aria-hidden="true" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}