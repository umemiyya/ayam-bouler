"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ImageIcon, Bird, TrendingUp, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardDef {
  label: string;
  value: string;
  delta?: string;
  icon: React.ElementType;
  accent: string;
}

interface StatsCardsProps {
  imagesProcessed: number;
  totalChickensCounted: number;
  avgChickensPerImage: number;
  todaysUploads: number;
}

export function StatsCards({
  imagesProcessed,
  totalChickensCounted,
  avgChickensPerImage,
  todaysUploads,
}: StatsCardsProps) {
  const stats: StatCardDef[] = [
  {
    label: "Gambar Diproses",
    value: imagesProcessed.toLocaleString(),
    delta: " ",
    icon: ImageIcon,
    accent: "text-accent bg-accent-soft",
  },
  {
    label: "Total Ayam Terhitung",
    value: totalChickensCounted.toLocaleString(),
    delta: " ",
    icon: Bird,
    accent: "text-confirmed bg-confirmed-soft",
  },
  {
    label: "Rata-rata per Gambar",
    value: avgChickensPerImage.toLocaleString(),
    delta: " ",
    icon: TrendingUp,
    accent: "text-[#7c9cbf] bg-[#7c9cbf1a]",
  },
  {
    label: "Unggahan Hari Ini",
    value: todaysUploads.toLocaleString(),
    delta: " ",
    icon: CalendarClock,
    accent: "text-warning bg-warning-soft",
  },
];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
        >
          <Card className="viewfinder group p-5 transition-shadow hover:shadow-[0_0_0_1px_var(--border-strong)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-2">
                  {stat.label}
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                  {stat.value}
                </p>
              </div>
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", stat.accent)}>
                <stat.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
            </div>
            {stat.delta && (
              <p className="mt-3 text-xs text-muted-2">{stat.delta}</p>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
